import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Animals } from '../models/animals.class';
import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Events } from '../models/events.class';
import { MatSnackBar,} from '@angular/material/snack-bar';
import { DataUpdateService } from '../data-update.service';

interface TreatmentsSelection {
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
    treatments: TreatmentsSelection[] = [ 
        { name: 'Medical Check-Up ', categoryColor: '#c9f7f9', duration: 2 },
        { name: 'Dental Care', categoryColor: '#fbd1d1', duration: 1 },
        { name: 'Vaccination', categoryColor: '#eec3fd', duration: 1 },
        { name: 'Castration', categoryColor: '#d4f9c6', duration: 2 },
        { name: 'Laboratory Test', categoryColor: '#f9f6c3', duration: 1 },
        { name: 'Operation', categoryColor: '#DBDBDB', duration: 3 },
    ];
    eventData: { day: Date, hour: string, name: string, treatmentName: string, duration: number, categoryColor: string, animalID:string, id:string } = {
      day: new Date(),
      hour: '',
      name: '',
      treatmentName: '',
      duration: 0,
      categoryColor: '',
      animalID: '',
      id: ''
    };
    loading = false;
    hideRequired = 'true';
    hours: string[] = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    firestore: Firestore = inject(Firestore);
    animalList:any = [];
    unsubList;
    event = new Events();
    selectedTreatment!:any;
    existingEventsArray: any[] = [];


    constructor(@Inject(MAT_DIALOG_DATA) public data: { day: Date, hour: string, row: number, column: number  }, private dialogRef: MatDialogRef<DialogAddEventComponent>, private snackBar: MatSnackBar, public dataUpdate: DataUpdateService) {
        this.eventData.day = data.day || new Date();
        this.eventData.hour = data.hour;
        this.unsubList = this.subAnimalList();
    }

    async saveEvent() {
        let animalID = this.findAnimalIDByName(this.eventData.name);
    
        if (this.selectedTreatment) {
            this.prepareEventData(this.selectedTreatment);

            if (this.isEventAfterClosingTime()) {
                this.messageEventAfterClosingTime();
                return;
            }
            if (!await this.isTreatmentDurationValid()) {
                this.messageOverlappingEvents();
                return;
            }
            if (animalID) {
                let eventData = this.createEventData(animalID);
                let docRef = await this.saveEventData(eventData);
                await this.updateDocument(docRef);
                this.saveProcess(eventData, docRef);               
            } 
        }
    }

    prepareEventData(selectedTreatment:any) {
        let { name, categoryColor, duration } = selectedTreatment;
    
        this.eventData.treatmentName = name;
        this.eventData.categoryColor = categoryColor;
        this.eventData.duration = duration;
        this.loading = true;
    }
    
    messageEventAfterClosingTime() {
        this.snackBar.open('The selected time exceeds the latest time available (18:00).', 'OK', {
            duration: 3000,
        });
        this.loading = false;
    }

    messageOverlappingEvents() {
        this.snackBar.open('The selected treatment duration overlaps with an existing event.', 'OK', {
            duration: 3000,
        });
        this.loading = false;
    }

    createEventData(animalID:string) {
        return {
            day: this.eventData.day,
            hour: this.eventData.hour,
            name: this.eventData.name,
            treatmentName: this.eventData.treatmentName,
            duration: this.eventData.duration,
            categoryColor: this.eventData.categoryColor,
            animalID: animalID,
        };
    }

    async saveEventData(eventData:any) {
        let eventsObject = new Events(eventData);
        return await addDoc(this.getEventRef(), eventsObject.toEventJson());
    }

    async updateDocument(docRef:any) {
        await updateDoc(doc(this.getEventRef(), docRef.id), { id: docRef.id });
    }

    saveProcess(eventData:any, docRef:any) {
        this.dialogRef.close({ ...eventData, id: docRef.id });
        this.loading = false;
    }

    findAnimalIDByName(animalName: string): string | undefined {
        let foundAnimal = this.animalList.find((animal: Animals) => animal.name === animalName);
        return foundAnimal ? foundAnimal.id : undefined;
    }

    isEventAfterClosingTime(): boolean {
        let endHour = this.calculateEndTime(this.eventData.hour, this.eventData.duration);
        return endHour > '19:00';
    }

    calculateEndTime(startTime: string, duration: number): string {
        let startHour = parseInt(startTime.split(':')[0], 10);
        let endHour = startHour + duration;
        
        return `${endHour.toString().padStart(2, '0')}:00`;
    }

    calculateStartTime(endTime: string, duration: number) {
        let endHour = parseInt(endTime.split(':')[0], 10);
        let startHour = endHour + 1 - duration;
    
        return `${startHour.toString().padStart(2, '0')}:00`;
    }

    async isTreatmentDurationValid(): Promise<boolean> {
        await this.getExistingEventsForDay(this.eventData.day);

        let newEndHour = this.calculateEndTime(this.eventData.hour, this.selectedTreatment.duration);
    
        for (let i = 0; i < this.existingEventsArray.length; i++) {
            let existingEvent = this.existingEventsArray[i];
            let existingStartHour = existingEvent.hour;
            let existingEndHour = this.calculateEndTime(existingEvent.hour, existingEvent.duration);
    
            if (newEndHour > existingStartHour && newEndHour <= existingEndHour) {
                return false;
            }
        }
        return true;
    }

    async getExistingEventsForDay(day: Date): Promise<any[]> {
        let startOfDay = new Date(day);
        let endOfDay = new Date(day);
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay.setHours(23, 59, 59, 999);
    
        let querySnapshot = await getDocs(query(collection(this.firestore, 'events'),
            where('day', '>=', startOfDay),
            where('day', '<=', endOfDay),
            where('day', '<', this.eventData.day) 
        ));
    
        this.existingEventsArray = [];
        querySnapshot.forEach((doc) => {
            this.existingEventsArray.push(doc.data());
        });
        return this.existingEventsArray;
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