import { Component, OnInit} from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';



@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})


export class CalendarComponent implements OnInit {
  currentWeek: { start: Date, end: Date } = { start: new Date(), end: new Date() };
  daysOfWeek: Date[] = [];
  hours: string[] = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  ngOnInit(): void {
      this.currentWeek = this.getcurrentWeek();
      this.generateDaysOfWeek();
  }

  getcurrentWeek(): { start: Date, end: Date } { 
      const today = new Date();
      const currentDay = today.getDay();
      const startDay = new Date(today);

      startDay.setDate(today.getDate() - currentDay + (currentDay === 0 ? -5 : 1));
      const endOfWeek = new Date(startDay);

      endOfWeek.setDate(startDay.getDate() + 4);
      return { start: startDay, end: endOfWeek };
  }

  previousWeek(): void {
      const startPreviousWeek = new Date(this.currentWeek.start);
      startPreviousWeek.setDate(startPreviousWeek.getDate() - 7);

      while (startPreviousWeek.getDay() !== 1) {
          startPreviousWeek.setDate(startPreviousWeek.getDate() - 1);
      }

      const endOfPreviousWeek = new Date(startPreviousWeek);
      endOfPreviousWeek.setDate(endOfPreviousWeek.getDate() + 4);
      this.currentWeek = { start: startPreviousWeek, end: endOfPreviousWeek };
      this.generateDaysOfWeek();
  }

  nextWeek(): void {
      const startNextWeek = new Date(this.currentWeek.end);
      startNextWeek.setDate(startNextWeek.getDate() + 1);

      while (startNextWeek.getDay() !== 1) {
        startNextWeek.setDate(startNextWeek.getDate() + 1);
      }

      const endOfNextWeek = new Date(startNextWeek);
      endOfNextWeek.setDate(endOfNextWeek.getDate() + 4);
      this.currentWeek = { start: startNextWeek, end: endOfNextWeek };
      this.generateDaysOfWeek();
  }

  generateDaysOfWeek(): void {
      const days: Date[] = [];
      const startDay = new Date(this.currentWeek.start);

      for (let i = 0; i < 5; i++) {
        const day = new Date(startDay);
        day.setDate(startDay.getDate() + i);
        days.push(day);
      }

      this.daysOfWeek = days;
  }
}