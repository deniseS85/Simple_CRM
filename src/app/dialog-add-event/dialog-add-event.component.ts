import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Animals } from '../models/animals.class';
import { addDoc, collection, doc, getDocs, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';


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

    eventData: { day: Date | null, hour: string, name: string, treatment: Treatment, animalID:number, id:number } = {
      day: null,
      hour: '',
      name: '',
      treatment: { name: '', categoryColor: '', duration: 0 },
      animalID: 0,
      id: 0
    };
    loading = false;
    hideRequired = 'true';
    hours: string[] = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    
    firestore: Firestore = inject(Firestore);
    animalList:any = [];
    unsubList;
  

    constructor(@Inject(MAT_DIALOG_DATA) public data: { day: Date, hour: string }, private dialogRef: MatDialogRef<DialogAddEventComponent>) {
        this.eventData.day = data.day || new Date();
        this.eventData.hour = data.hour;
        this.unsubList = this.subAnimalList();
    }

    async saveEvent() {
        let animalID = this.findAnimalIDByName(this.eventData.name);
        this.loading = true;
      
        if (animalID) {
            const eventData = {
              day: this.eventData.day,
              hour: this.eventData.hour,
              name: this.eventData.name, 
              treatment: this.eventData.treatment,
              animalID: animalID,
            };
            try {
              let docRef = await addDoc(this.getEventRef(), eventData);
              await updateDoc(doc(this.getEventRef(), docRef.id), { id: docRef.id }); 
              this.dialogRef.close({ ...eventData, id: docRef.id }); 
              this.loading = false;
            } catch (error) {
                console.error('Error adding event: ', error);
            }
        } else {
            console.error(`Animal with name ${this.eventData.name} not found.`);
        }
    }


    findAnimalIDByName(animalName: string): string | undefined {
        let foundAnimal = this.animalList.find((animal: Animals) => animal.name === animalName);
        return foundAnimal ? foundAnimal.id : undefined;
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

    ngOnDestroy() {
        this.unsubList(); 
    }

    getUserRef() {
        return collection(this.firestore, 'users');
    }

    getEventRef() {
        return collection(this.firestore, 'events');
    }
}
