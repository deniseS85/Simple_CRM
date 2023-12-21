import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Animals } from '../models/animals.class';
import { collection, doc, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../models/user.class';

/* import { Treatment } from '../models/treatments.class'; */

export interface Treatment {
  name: string;
  categoryColor: string;
  duration: number;   
}

@Component({
  selector: 'app-dialog-add-event',
  templateUrl: './dialog-add-event.component.html',
  styleUrls: ['./dialog-add-event.component.scss']
})
export class DialogAddEventComponent {
  treatments: Treatment[] = [
    { name: 'Medical Check-Up ', categoryColor: '#c9f7f9', duration: 2 },
    { name: 'Dental Care', categoryColor: '#fbd1d1', duration: 1 },
    { name: 'Vaccination', categoryColor: '#eec3fd', duration: 1 },
    { name: 'Castration', categoryColor: '#d4f9c6', duration: 2 },
    { name: 'Laboratory Test', categoryColor: '#f9f6c3', duration: 1 },
    { name: 'Operation', categoryColor: '#DBDBDB', duration: 3 },
  ];

  eventData: { day: Date | null, hour: string, name: string, treatment: Treatment, id:number } = {
    day: null,
    hour: '',
    name: '',
    treatment: { name: '', categoryColor: '', duration: 0 },
    id: 1
  };
  loading = false;
  hideRequired = 'true';
  hours: string[] = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  
  firestore: Firestore = inject(Firestore);
/*   animalList:any = []; */
  user = new User();

  constructor(@Inject(MAT_DIALOG_DATA) public data: { day: Date, hour: string }, private dialogRef: MatDialogRef<DialogAddEventComponent>) {
    this.eventData.day = data.day || new Date();
    this.eventData.hour = data.hour;
  }

  saveEvent(): void {
      const eventData = {
        day: this.eventData.day,
        hour: this.eventData.hour,
        name: this.eventData.name, 
        treatment: this.eventData.treatment,
        id: this.eventData.id
      };

      this.dialogRef.close(eventData);
  }

  convertDateFormat(date: Date | null): string {
      if (!date) {
          return '';
      }
      const dayOfMonth = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const formattedDay = (dayOfMonth < 10) ? `0${dayOfMonth}` : `${dayOfMonth}`;
      const formattedMonth = (month < 10) ? `0${month}` : `${month}`;

      return `${formattedDay}.${formattedMonth}.${year}`;
  }
}
