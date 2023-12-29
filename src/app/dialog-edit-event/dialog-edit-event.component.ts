import { Component, Inject, inject } from '@angular/core';
import { Animals } from '../models/animals.class';
import { Firestore, collection, deleteDoc, doc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataUpdateService } from '../data-update.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  selectedTreatment!:any;

  constructor(@Inject(MAT_DIALOG_DATA) public event: any, private dataUpdate: DataUpdateService, public dialogRef: MatDialogRef<DialogEditEventComponent>, private snackBar: MatSnackBar) {
      this.unsubList = this.subAnimalList();
      this.selectedDate = event.day;
      this.selectedHour = event.hour;
  }
  

  ngOnDestroy() {
      this.unsubList(); 
  }

  saveChangeEvent() {
      if (this.event.id && this.event.day && this.event.hour && this.event.name && this.event.treatmentName) {
          let selectedTreatment = this.treatments.find(treatment => treatment.name === this.event.treatmentName);

          if (selectedTreatment) {
              let { name, categoryColor, duration } = selectedTreatment;
              const updatedEventData = {
                name: this.event.name,
                treatmentName: name,
                categoryColor: categoryColor,
                day: this.selectedDate,
                hour: this.selectedHour,
                duration: duration,
            };

                if (this.isEventAfterClosingTime(duration, this.selectedHour)) {
                      this.snackBar.open('The selected time exceeds the latest time available (18:00).', 'OK', {
                          duration: 3000,
                          
                      });
                } else {
                    updateDoc(this.getEventID(), updatedEventData).then(() => {
                        this.reloadEventData();
                        this.dialogRef.close();
                    }).catch((error) => {
                        console.error('Error updating event in Firebase: ', error);
                    });
                }
          } else {
              console.error('Selected treatment not found.');
          }
      }
  }

  isEventAfterClosingTime(duration:number, hour:string): boolean {
      let endHour = this.calculateEndTime(hour, duration);
      return endHour > '19:00';
  }

  calculateEndTime(startTime: string, duration: number): string {
      let startHour = parseInt(startTime.split(':')[0], 10);
      let endHour = startHour + duration;
      
      return `${endHour.toString().padStart(2, '0')}:00`;
  }

  getEventID() {
      let eventId = this.event.id;
      return doc(this.firestore, 'events', eventId);
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
      deleteDoc(this.getEventID()).then(() => {
          this.reloadEventData();
          this.dialogRef.close();
      }).catch((error) => {
          console.error('Error deleting event from Firebase: ', error);
      });
      this.isConfirmationVisible = false;
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
