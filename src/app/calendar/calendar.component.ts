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
    lastAppointmentDuration: number = 0;
    lastAppointmentDay!: Date;
    calendarArray: number[][] = [];


    constructor(public dialog: MatDialog, public dataUpdate: DataUpdateService, private snackBar: MatSnackBar) {
        this.dataUpdate.getAllEvents();

    }

    ngOnInit(): void {
        this.currentWeek = this.getcurrentWeek();
        this.generateDaysOfWeek();
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

    previousWeek(): void {
        let startPreviousWeek = new Date(this.currentWeek.start);
        startPreviousWeek.setDate(startPreviousWeek.getDate() - 7);
    
        let endOfPreviousWeek = new Date(startPreviousWeek);
        endOfPreviousWeek.setDate(endOfPreviousWeek.getDate() + 4);
        this.currentWeek = { start: startPreviousWeek, end: endOfPreviousWeek };
        this.generateDaysOfWeek();
    }


    nextWeek(): void {
        let startNextWeek = new Date(this.currentWeek.start);
        startNextWeek.setDate(startNextWeek.getDate() + 7);
    
        let endOfNextWeek = new Date(startNextWeek);
        endOfNextWeek.setDate(endOfNextWeek.getDate() + 4);
        this.currentWeek = { start: startNextWeek, end: endOfNextWeek };
        this.generateDaysOfWeek();
    }

    generateDaysOfWeek(): void {
        let days: Date[] = [];
        let startDay = new Date(this.currentWeek.start);
    
        for (let i = 0; days.length < 5; i++) {
            let day = new Date(startDay);
            day.setDate(startDay.getDate() + i);
    
            // Überspringe Samstag (6) und Sonntag (0)
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

        if (!isCellOccupiedAfterDialog) {
            this.toHiddenCell(day, hour, result.duration);
        }
    } 

   /*  lastAppointmentDuration:number = 0;
    lastAppointmentDay!:Date;
    calendarArray: number[][] = []; */

   /*  isDurationOneHour(event:any, row:number, column:number) {
        return true;
        if (event.length > 0) {
            console.log(event);
            // Wenn ein Termin existiert
            if (event[0].duration > 1) {
                // Wenn es ein mehrstündiger Termin ist
                this.calendarArray[row][column] = 0;
                this.lastAppointmentDuration = event[0].duration;
                this.lastAppointmentDay = event[0].day;

                // td-Zelle nur einmal anzeigen, für die nachfolgenden Stunden nicht
                return true;
            } else {
                // Wenn es ein einstündiger Termin ist
                this.lastAppointmentDuration = 0;
                // td-Zelle immer anzeigen
                return true;
            }
        } else {
            // Wenn keine Termine existieren
            if (this.lastAppointmentDuration > 1) {
                // Wenn in der vorherigen Stunde ein Termin existiert
                this.lastAppointmentDuration--;
                this.calendarArray[row][column] = 0;
                // td-Zelle nicht anzeigen, weil in der vorherigen Stunde bereits die td-Zelle angezeigt wird
                return false;
            } else {
                // Wenn in der vorherigen Stunde kein Termin existierte
                this.lastAppointmentDuration = 0;
                this.calendarArray[row][column] = 0;
                return true;
            }
            
        }
    } */
    isDurationOneHour(event: any, row: number, column: number) {
        const rows = 24;  
        const columns = 7; 

        this.calendarArray = new Array(rows);
            for (let i = 0; i < rows; i++) {
                this.calendarArray[i] = new Array(columns).fill(0);
            }
        if (event.length > 0) {
          /*   console.log(event); */
   
            if (event[0].duration > 1) {
                // Wenn es ein mehrstündiger Termin ist
                if (this.calendarArray[row][column] === 0) {
                    // Wenn die Zelle noch nicht belegt ist
                    this.calendarArray[row][column] = event[0].duration;

                    // Setze die Werte für die nachfolgenden Zellen auf -1, um sie zu überspringen
                    for (let i = 1; i < event[0].duration; i++) {
                        this.calendarArray[row][column + i] = -1;
                    }

                    this.lastAppointmentDuration = event[0].duration;
                    this.lastAppointmentDay = event[0].day;

                    // td-Zelle nur einmal anzeigen, für die nachfolgenden Stunden nicht
                    return true;
                } else {
                    // Wenn die Zelle bereits belegt ist, überspringe sie
                    return false;
                }
            } else {
                // Wenn es ein einstündiger Termin ist
                this.lastAppointmentDuration = 0;
                // td-Zelle immer anzeigen
                return true;
            }
        } else {
            // Wenn keine Termine existieren
            if (this.lastAppointmentDuration > 1) {
                // Wenn in der vorherigen Stunde ein Termin existiert
                this.lastAppointmentDuration--;

                // Überspringe die Zellen, die bereits für den mehrstündigen Termin belegt sind
                if (this.calendarArray[row][column] === -1) {
                    return false;
                 }

                // Setze den Wert im 2D-Array entsprechend
                this.calendarArray[row][column] = 0;

                // td-Zelle nicht anzeigen, weil in der vorherigen Stunde bereits die td-Zelle angezeigt wird
                return false;
            } else {
                // Wenn in der vorherigen Stunde kein Termin existierte
                this.lastAppointmentDuration = 0;

                // Setze den Wert im 2D-Array entsprechend
                this.calendarArray[row][column] = 0;

                return true;
            }
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