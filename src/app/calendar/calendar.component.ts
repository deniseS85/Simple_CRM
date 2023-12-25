import { Component, OnInit } from '@angular/core';
import { DialogAddEventComponent } from '../dialog-add-event/dialog-add-event.component';
import { MatDialog } from '@angular/material/dialog';
import { DataUpdateService } from '../data-update.service';
import { MatSnackBar,} from '@angular/material/snack-bar';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})

export class CalendarComponent implements OnInit {
    currentWeek: { start: Date, end: Date } = { start: new Date(), end: new Date() };
    daysOfWeek: Date[] = [];
    hours: string[] = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    currentDay: Date = new Date();
    eventPosition: { top: number, left: number } = { top: 0, left: 0 };


    constructor(public dialog: MatDialog, public dataUpdate: DataUpdateService, private snackBar: MatSnackBar) {
        this.dataUpdate.getAllEvents();

    }

    ngOnInit(): void {
        this.currentWeek = this.getcurrentWeek();
        this.generateDaysOfWeek();
    }

    getcurrentWeek(): { start: Date, end: Date } { 
        let today = new Date();
        let currentDay = today.getDay();
        let startDay = new Date(today);

        startDay.setDate(today.getDate() - currentDay + (currentDay === 0 ? -5 : 1));
        let endOfWeek = new Date(startDay);

        endOfWeek.setDate(startDay.getDate() + 4);
        return { start: startDay, end: endOfWeek };
    }

    addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      }

    previousWeek(): void {
        let startPreviousWeek = new Date(this.currentWeek.start);
        startPreviousWeek.setDate(startPreviousWeek.getDate() - 7);

        while (startPreviousWeek.getDay() !== 1) {
            startPreviousWeek.setDate(startPreviousWeek.getDate() - 1);
        }

        let endOfPreviousWeek = new Date(startPreviousWeek);
        endOfPreviousWeek.setDate(endOfPreviousWeek.getDate() + 4);
        this.currentWeek = { start: startPreviousWeek, end: endOfPreviousWeek };
        this.generateDaysOfWeek();
    }


    nextWeek(): void {
        let startNextWeek = new Date(this.currentWeek.end);
        startNextWeek.setDate(startNextWeek.getDate() + 1);

        while (startNextWeek.getDay() !== 1) {
            startNextWeek.setDate(startNextWeek.getDate() + 1);
        }

        let endOfNextWeek = new Date(startNextWeek);
        endOfNextWeek.setDate(endOfNextWeek.getDate() + 4);
        this.currentWeek = { start: startNextWeek, end: endOfNextWeek };
        this.generateDaysOfWeek();
    }

    generateDaysOfWeek(): void {
        let days: Date[] = [];
        let startDay = new Date(this.currentWeek.start);
    
        for (let i = 0; i < 5; i++) {
            let day = new Date(startDay);
            day.setDate(startDay.getDate() + i);
            days.push(day);
        }
    
        this.daysOfWeek = days;
        this.currentDay = days[0];
    }

    today() {
        this.currentWeek = this.getcurrentWeek();
        this.generateDaysOfWeek();
    }

    isToday(date: Date): boolean {
        let today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    isPastDay(day: Date): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return day < today;
    }

    openEventDialog(day: Date, hour: string, event: MouseEvent): void {
        let isCellOccupied = this.isCellOccupied(day, hour);

        if (isCellOccupied) {
                this.snackBar.open('Time is already reserved.', 'OK', {
                    duration: 3000,
                });
            return;
        }
        
        const dialog = this.dialog.open(DialogAddEventComponent, {
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
        
        dialog.afterClosed().subscribe(result => {
            if (result) {
              this.closeEventDialog(result, day, hour);
            }
        });
    }

    closeEventDialog(result: any, day: Date, hour: string) {
        let isCellOccupiedAfterDialog = this.isCellOccupied(day, hour);
    

        /* hier schauen, er geht nicht in den if-bereich!!!! */
        if (!isCellOccupiedAfterDialog) {
            console.log('ist nicht belegt');
            this.toHiddenCell(day, hour, result.duration);
        }
    }
      
    toHiddenCell(day: Date, hour: string, duration: number) {
        let column = this.calculateColumn(day);
        let row = this.calculateRow(hour);

        for (let i = 1; i < duration; i++) {
            let nextRow = row + i;
            let nextCell = `${nextRow} ${column}`;
            let hiddenCellElement = document.getElementById(nextCell);
           
    
            if (hiddenCellElement && hiddenCellElement.style.display !== 'none') {
                hiddenCellElement.style.display = 'none';
            }
        }
    }

    calculateColumn(day: Date): number {
        let dayIndex = day.getDay();
        return dayIndex >= 1 && dayIndex <= 5 ? dayIndex - 1 : -1;
    }
    
    calculateRow(hour: string): number {
        let startHour = 10;
        let eventHour = parseInt(hour, 10);
        return Math.max(eventHour - startHour, 0);
    }

   
    isCellOccupied(day: Date, hour: string): boolean {
        return this.dataUpdate.eventsList.some((event) => {
            let eventDay: Date;
    
            if (event.day instanceof Date) {
                eventDay = event.day;
            } else if (event.day && typeof event.day === 'object' && 'seconds' in event.day) {
                eventDay = new Date((event.day as any).seconds * 1000);
            } else {
                return false; // Wenn weder Date noch Timestamp vorhanden ist, ist die Zelle nicht belegt.
            }
    
            return eventDay.toDateString() === day.toDateString() && event.hour === hour;
        });
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
        
        return `${endHour.toString().padStart(2, '0')}:00`;
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

    getRowspan(duration: number) {
        return duration ? duration : 1;
    }

    /**
     * gibt ein Array von Ereignissen zurück
     * @param day an einem bestimmten Tag
     * @param hour zu einer bestimmten Stunde
     * @returns 
     */
    getVisibleEvents(day: Date, hour: string): any[] {
        return this.dataUpdate.eventsList.filter((event) => {
            const eventDay: Date | undefined =
                event.day instanceof Date
                    ? event.day
                    : event.day && typeof event.day === 'object' && 'seconds' in event.day
                    ? new Date((event.day as any).seconds * 1000)
                    : undefined;
    
            if (!eventDay) {
                return false; // Wenn weder Date noch Timestamp vorhanden ist, schließe das Event aus.
            }
    
            const eventHour = event.hour;
            const isSameDay = eventDay.toDateString() === day.toDateString();
            const isSameHour = eventHour === hour;
    
            return isSameDay && isSameHour;
        });
    }
  

    getMaxRowspan(day: Date, hour: string): number {
        let rowspan = 1;
    
        const eventsForCell = this.dataUpdate.eventsList.filter((event) => {
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
    
        return rowspan;
    }
    
}