import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DialogAddEventComponent } from '../dialog-add-event/dialog-add-event.component';
import { MatDialog } from '@angular/material/dialog';
import { DataUpdateService } from '../data-update.service';
import { MatSnackBar,} from '@angular/material/snack-bar';
import { refFromURL } from '@angular/fire/database';

/* import { Treatment } from '../models/treatments.class'; */

export interface Treatment {
  name: string;
  categoryColor: string;
  duration: number;   
}


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
  eventData: { day: Date | null, hour: string, name: string, treatment: Treatment } = { day: null, hour: '', name: '', treatment: { name: '', categoryColor: '', duration: 0 } };
  events: any[] = [];
  eventIdCounter: number = 1;

  constructor(public dialog: MatDialog, private dataUpdate: DataUpdateService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
      this.currentWeek = this.getcurrentWeek();
      this.generateDaysOfWeek();
     /*  this.events = this.dataUpdate.getEvents(); */
      this.events.forEach(event => {
        this.toHiddenCell(event.row, event.column);
      });
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

  openEventDialog(day: Date, hour: string, event: MouseEvent, row:number, column:number): void {
      const isCellOccupied = this.isCellOccupied(day, hour);
    
      if (isCellOccupied) {
            this.snackBar.open('Time is already reserved.', 'OK', {
                duration: 3000,
            });
        return;
      }
    
      let dialogRef = this.dialog.open(DialogAddEventComponent, {
          data: {
            day: day,
            hour: hour,
            name: '',
            treatment: { name: '', categoryColor: '', duration: 0 },
            id: 1
          }
        });
    
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.closeEventDialog(result, day, hour, row, column, event);
            }
        });
  }

  closeEventDialog(result:any, day:Date, hour:string, row:number, column:number, event:any) {
      let isCellOccupiedAfterDialog = this.isCellOccupied(day, hour);

      if (!isCellOccupiedAfterDialog) {
          this.events.push({ ...result, id: this.eventIdCounter++ });
          this.eventData = result;
          this.toHiddenCell(row, column);
          console.log(this.events);
      } 
  }


  toHiddenCell(row: number, column: number) {
      const duration = this.eventData.treatment.duration;
    
      if (duration > 1) {
          for (let i = 1; i < duration; i++) {
            const nextRow = row + i;
            const nextCell = `${nextRow} ${column}`;
            const hiddenCellElement = document.getElementById(nextCell);
      
            if (hiddenCellElement && hiddenCellElement.style.display !== 'none') {
                hiddenCellElement.style.display = 'none';
            }
          }
      }
  }

  isCellOccupied(day: Date, hour: string): boolean {
      return this.events.some(event => {
          const eventDay = new Date(event.day);
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

  getTreatmentCategoryClass(treatment: Treatment): string {
      switch (treatment.categoryColor) {
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

  getRowspan(treatment: Treatment): number {
      return treatment ? treatment.duration : 1;
  }


  /**
   * gibt ein Array von Ereignissen zurück
   * @param day an einem bestimmten Tag
   * @param hour zu einer bestimmten Stunde
   * @returns 
   */
  getVisibleEvents(day: Date, hour: string): any[] {
      return this.events.filter(event => {
        const eventDay = new Date(event.day);
        return eventDay.toDateString() === day.toDateString() && event.hour === hour;
      });
  }


  getMaxRowspan(day: Date, hour: string): number {
    let rowspan = 1;
  
    const eventsForCell = this.events.filter(event => {
      const eventDay = new Date(event.day);
      return eventDay.toDateString() === day.toDateString() && event.hour === hour;
    });
  
    if (eventsForCell.length > 0) {
      const maxDuration = Math.max(...eventsForCell.map(event => event.treatment.duration));
      rowspan = maxDuration;
    }
  
    return rowspan;
  }
}
