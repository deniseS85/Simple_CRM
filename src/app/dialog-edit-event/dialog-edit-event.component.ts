import { Component, Inject, inject } from '@angular/core';
import { Animals } from '../models/animals.class';
import { Firestore, collection, deleteDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataUpdateService } from '../data-update.service';

interface TreatmentsSelection {
  name: string;
  categoryColor: string;
  duration: number;
  cost?: number;
}

@Component({
  selector: 'app-dialog-edit-event',
  templateUrl: './dialog-edit-event.component.html',
  styleUrl: './dialog-edit-event.component.scss'
})
export class DialogEditEventComponent {
  treatments: TreatmentsSelection[] = [ 
    { name: 'Medical Check-Up ', categoryColor: '#c9f7f9', duration: 2, cost: 140 },
    { name: 'Dental Care', categoryColor: '#fbd1d1', duration: 1, cost: 80 },
    { name: 'Vaccination', categoryColor: '#eec3fd', duration: 1, cost: 50 },
    { name: 'Castration', categoryColor: '#d4f9c6', duration: 2, cost: 150 },
    { name: 'Laboratory Test', categoryColor: '#f9f6c3', duration: 1, cost: 120 },
    { name: 'Operation', categoryColor: '#DBDBDB', duration: 3, cost: 300 },
];
  firestore: Firestore = inject(Firestore);
  loading = false;
  hideRequired = 'true';
  selectedDate: Date;
  selectedHour: string;
  hours: string[] = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']; 
  animalList:any = [];
  unsubList;
  isConfirmationVisible = false;

  constructor(@Inject(MAT_DIALOG_DATA) public event: any, private dataUpdate: DataUpdateService, public dialogRef: MatDialogRef<DialogEditEventComponent>) {
      this.unsubList = this.subAnimalList();
      this.selectedDate = event.day;
      this.selectedHour = event.hour;
  }
  

  ngOnDestroy() {
      this.unsubList(); 
  }

  saveChangeEvent() {
  
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

  confirmDeletion(): void {
      let eventId = this.event.id;
      this.deleteEventFromFirebase(eventId);
      this.isConfirmationVisible = false;
  }

  deleteEventFromFirebase(eventId: string): void {
      let eventDocRef = doc(this.firestore, 'events', eventId);
    
      deleteDoc(eventDocRef).then(() => {
          this.reloadEventData();
          this.dialogRef.close();
      }).catch((error) => {
          console.error('Error deleting event from Firebase: ', error);
      });
  }

  reloadEventData() {
      this.dataUpdate.getAllEvents();
  }
  

  subAnimalList() {
      return onSnapshot(this.getUserRef(), (usersSnapshot) => {
          this.animalList = [];
    
          usersSnapshot.forEach((userDoc) => {
              let userData = userDoc.data();
              if (userData && userData["animals"]) {
                let userAnimals = userData["animals"].map((animalData: any) => {
                    return new Animals().setAnimalObject(animalData, animalData.id);
                });
                this.animalList.push(...userAnimals);
              }
          });
      });
  }

  getUserRef() {
      return collection(this.firestore, 'users');
  } 

  convertDateFormat(date: Date | null): string {
      if (!date) {
          return '';
      }
      let dayOfMonth = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let formattedDay = (dayOfMonth < 10) ? `0${dayOfMonth}` : `${dayOfMonth}`;
      let formattedMonth = (month < 10) ? `0${month}` : `${month}`;

      return `${formattedDay}.${formattedMonth}.${year}`;
  }
  
}
