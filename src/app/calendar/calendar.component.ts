import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { DialogAddEventComponent } from '../dialog-add-event/dialog-add-event.component';
import { MatDialog } from '@angular/material/dialog';
import { DataUpdateService } from '../data-update.service';
import { Events } from '../models/events.class';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, deleteDoc, doc, getDocs, query, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})

export class CalendarComponent implements OnInit, OnDestroy  {
    firestore: Firestore = inject(Firestore);
    currentWeek: { start: Date, end: Date } = { start: new Date(), end: new Date() };
    daysOfWeek: Date[] = [];
    hours: string[] = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    currentDay: Date = new Date();
    eventPosition: { top: number, left: number } = { top: 0, left: 0 };
    calendarArray: boolean[][] = new Array(9).fill(true).map(() => new Array(5).fill(true)); 
    private unsubscribe$: Subject<void> = new Subject<void>();
    @ViewChild('calendarContainer', { read: ElementRef }) calendarContainer!: ElementRef;
    selectedDate: Date | null = null;
    isMobileView: boolean = false;
    isConfirmationVisible = false;
    loading = false;
    selectedEvent: Events | null = null;  

    constructor(public dialog: MatDialog, public dataUpdate: DataUpdateService, private route: ActivatedRoute) {
        this.dataUpdate.getAllEvents();
    }

    ngOnInit(): void {
        this.currentWeek = this.getcurrentWeek();
        this.generateDaysOfWeek();
        this.calendarArray = new Array(9).fill(true).map(() => new Array(5).fill(true));
        this.subscribeToEventsList();
        this.handleSelectedDateQueryParam();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private subscribeToEventsList(): void {
        this.dataUpdate.eventsList$.pipe(takeUntil(this.unsubscribe$)).subscribe((eventsList) => {});
    }

    private handleSelectedDateQueryParam(): void {
        this.route.queryParams.subscribe(params => {
            let selectedDate = params['selectedDate'];
            if (selectedDate) {
              let dateToSetWeek = new Date(selectedDate);
              this.setWeekForSelectedDate(dateToSetWeek);
            }
          });
    }

    @HostListener('window:resize', ['$event'])
        onResize(event:any) {
            this.isMobileView = window.innerWidth <= 430;
    }

    getFormattedTime(startTime: any): string {
        if (this.isMobileView) {
          return startTime.endsWith(':00') ? startTime.slice(0, -3) : startTime;
        } else {
          return startTime.endsWith(':00') ? startTime : `${startTime.toString().padStart(2, '0')}:00`;
        } 
      }

    setWeekForSelectedDate(selectedDate: Date): void {
        let weekStart = this.getWeekStartDate(selectedDate);
      
        this.currentWeek = {
          start: weekStart,
          end: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 4),
        };
      
        this.generateDaysOfWeek();
    }
      
    getWeekStartDate(date: Date): Date {
        let startDay = new Date(date);
        startDay.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
        return startDay;
    }

    getcurrentWeek(): { start: Date, end: Date } { 
        let today = new Date();
        let startDay = new Date(today);
        
        if (today.getDay() !== 0 && today.getDay() !== 6) {
            startDay.setDate(today.getDate());
        } else {
            while (startDay.getDay() !== 1) {
                startDay.setDate(startDay.getDate() + 1);
            }
        }
        let endOfWeek = new Date(startDay);
        endOfWeek.setDate(startDay.getDate() + 6);
        return { start: startDay, end: endOfWeek };
    }
    
    addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    private updateWeek(offset: number): void {
        let start = new Date(this.currentWeek.start);
        start.setDate(start.getDate() + offset);
        let end = new Date(start);
        end.setDate(end.getDate() + 4);
        this.currentWeek = { start, end };
        this.generateDaysOfWeek();
        this.calendarArray = new Array(9).fill(true).map(() => new Array(5).fill(true));
    }
    
    previousWeek(): void {
        this.updateWeek(-7);
    }
    
    nextWeek(): void {
        this.updateWeek(7);
    }
    
    generateDaysOfWeek(): void {
        let days: Date[] = [];
        let startDay = new Date(this.currentWeek.start);
    
        for (let i = 0; days.length < 5; i++) {
            let day = new Date(startDay);
            day.setDate(startDay.getDate() + i);
    
            if (day.getDay() !== 0 && day.getDay() !== 6) {
                days.push(day);
            }
        }
        this.daysOfWeek = days;
        this.currentDay = days[0];
    }
    
    today() {
        this.currentWeek = this.getcurrentWeek();
        this.generateDaysOfWeek();
        this.calendarArray = new Array(9).fill(true).map(() => new Array(5).fill(true) ); 
    }

    isToday(date: Date): boolean {
        let today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    isPastDay(day: Date): boolean {
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        return day < today;
    }

    openEventDialog(day: Date, hour: string, event: MouseEvent): void {
        let isCellOccupied = this.isCellOccupied(day, hour);

        if (isCellOccupied) {
            let visibleEvents = this.getVisibleEvents(day, hour);
        if (visibleEvents.length > 0) {
            this.selectedEvent = visibleEvents[0];
            this.openDeleteConfirmationDialog();
        }
        return;
        }
        
        this.dialog.open(DialogAddEventComponent, {
            data: {
                day: day,
                hour: hour,
                name: '',
                treatmentName: '',
                duration: 0,
                categoryColor: '',
                id: '',
                animalID: '',  
            }
        });
    }

    isDurationOneHour(event:any, row:number, column:number) {
        if (event.length > 0) {
            // Wenn ein Termin existiert
            if (event[0].duration > 1) {
                //Wenn es ein mehrstündiger Termin ist, dann die nachfolgenden Zellen nicht erstellen lassen
                for (let dID = 1; dID < event[0].duration; dID++) {
                    this.calendarArray[row+dID][column] = false;
                }
                // td-Zelle nur einmal anzeigen, für die nachfolgenden Stunden nicht
                return true;
            } else {
                // td-Zelle immer anzeigen, weil es nur ein einstündiger Termin ist
                return true;
            }
        } else {
            //Wenn kein Termin existiert
            if (this.calendarArray[row][column]) {
                return true;
            } else {
                //Wenn in der vorherigen Stunde ein mehrstündiger Termin gab, dann wurde die td-Zelle mit rowspan verlängert. Deshalb keine weitere td-Zelle erstellen. 
                return false;
            }
        }
    }

    isCellOccupied(day: Date, hour: string): boolean {
        let isOccupied = false;
    
        this.dataUpdate.eventsList$.subscribe((eventsList) => {
            isOccupied = eventsList.some((event) => {
                let eventDay: Date;
    
                if (event.day instanceof Date) {
                    eventDay = event.day;
                } else if (event.day && typeof event.day === 'object' && 'seconds' in event.day) {
                    eventDay = new Date((event.day as any).seconds * 1000);
                } else {
                    return false;
                }
                return eventDay.toDateString() === day.toDateString() && event.hour === hour;
            });
        });
        return isOccupied;
    } 
    
    convertDateFormat(dateString: string): string {
        let date = new Date(dateString);
        let dayOfMonth = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let formattedDay = (dayOfMonth < 10) ? `0${dayOfMonth}` : `${dayOfMonth}`;
        let formattedMonth = (month < 10) ? `0${month}` : `${month}`;
        return `${formattedDay}.${formattedMonth}.${year}`;
    }

    calculateEndTime(startTime: string, duration: number): string {
        let startHour = parseInt(startTime.split(':')[0], 10);
        let endHour = startHour + duration;
        if (this.isMobileView) {
            return `${endHour < 10 ? '0' : ''}${endHour}`;
          } else {
            return `${endHour.toString().padStart(2, '0')}:00`;
          }
    }

    getTreatmentCategoryClass(categoryColor: string) {
        switch (categoryColor) {
            case '#c9f7f9':
                return 'medical-check-up';
            case '#fbd1d1':
                return 'dental-care';
            case '#eec3fd':
                return 'vaccination';
            case '#d4f9c6':
                return 'castration';
            case '#f9f6c3':
                return 'laboratory-test';
            case '#DBDBDB':
                return 'operation';
            default:
                return '';
        }
    }

    /**
     * gibt ein Array von Ereignissen zurück
     * @param day an einem bestimmten Tag
     * @param hour zu einer bestimmten Stunde
     * @returns 
     */
    getVisibleEvents(day: Date, hour: string): any[] {
        let visibleEvents: Events[] = [];
        
        this.dataUpdate.eventsList$.subscribe((eventsList) => {
            visibleEvents = eventsList.filter((event) => {
                const eventDay: Date | undefined =
                    event.day instanceof Date
                        ? event.day
                        : event.day && typeof event.day === 'object' && 'seconds' in event.day
                        ? new Date((event.day as any).seconds * 1000)
                        : undefined;
    
                if (!eventDay) {
                    return false;
                }
    
                let eventHour = event.hour;
                let isSameDay = eventDay.toDateString() === day.toDateString();
                let isSameHour = eventHour === hour;
    
                return isSameDay && isSameHour;
            });
        });
    
        return visibleEvents;
    }

    getMaxRowspan(day: Date, hour: string): number {
        let rowspan = 1;
        
        this.dataUpdate.eventsList$.subscribe((eventsList) => {
            const eventsForCell = eventsList.filter((event) => {
                const eventDay: Date | undefined =
                    event.day instanceof Date
                        ? event.day
                        : event.day && typeof event.day === 'object' && 'seconds' in event.day
                        ? new Date((event.day as any).seconds * 1000)
                        : undefined;
    
                return eventDay && eventDay.toDateString() === day.toDateString() && event.hour === hour;
            });
    
            if (eventsForCell.length > 0) {
                const maxDuration = Math.max(...eventsForCell.map((event) => event.duration));
                rowspan = maxDuration;
            }
        });
    
        return rowspan;
    }

    openDeleteConfirmationDialog() {
        this.isConfirmationVisible = true;
    }

    closeDeleteConfirmationDialog(): void {
        this.isConfirmationVisible = false;
    }

    doNotClose(event: any): void {
        event.stopPropagation();
    }

    deleteEvent(): void {
        if (this.selectedEvent) {
            this.loading = true;
            deleteDoc(this.getEventID(this.selectedEvent.id)).then(async () => {
                let querySnapshot = await getDocs(query(this.getWorkflowRef(), where('id', '==', this.selectedEvent?.id)));
    
                if (querySnapshot.size > 0) {
                    let existingWorkflowItem = querySnapshot.docs[0];
                    await deleteDoc(existingWorkflowItem.ref);
                }
                this.loading = false;
                this.selectedEvent = null;
                this.calendarArray = new Array(9).fill(true).map(() => new Array(5).fill(true));
            }).catch((error) => {
                console.error('Error deleting event from Firebase: ', error);
                this.loading = false;
            });
            this.isConfirmationVisible = false;
        }
    }

    getEventID(eventId: string) {
        return doc(this.firestore, 'events', eventId);
    }

    getWorkflowRef() {
        return collection(this.firestore, 'workflow');
    }
}