import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Animals } from '../models/animals.class';
import { QuerySnapshot, addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Events, TreatmentsSelection } from '../models/events.class';
import { MatSnackBar,} from '@angular/material/snack-bar';
import { DataUpdateService } from '../data-update.service';


@Component({
  selector: 'app-dialog-add-event',
  templateUrl: './dialog-add-event.component.html',
  styleUrls: ['./dialog-add-event.component.scss']
})
export class DialogAddEventComponent implements OnInit{
    loading = false;
    hideRequired = 'true';
    hours: string[] = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    firestore: Firestore = inject(Firestore);
    animalList:any = [];
    unsubList:any;
    event = new Events();
    selectedTreatment!:any;
    existingEventsArray: any[] = [];
    treatmentsData: TreatmentsSelection[] = Events.treatments;


    constructor(@Inject(MAT_DIALOG_DATA) public data: { day: Date, hour: string, row: number, column: number  }, private dialogRef: MatDialogRef<DialogAddEventComponent>, private snackBar: MatSnackBar, public dataUpdate: DataUpdateService) {
        this.event.day = data.day || new Date();
        this.event.hour = data.hour;
    }

    async ngOnInit() {
        await this.subAnimalListAndSubscribe();
    }

    async saveEvent() {
        const startTime = performance.now(); 
        let animalID = this.findAnimalIDByName(this.event.name);
    
        if (this.selectedTreatment) {
            this.prepareEventData(this.selectedTreatment, animalID);

            if (this.isEventAfterClosingTime()) {
                this.messageEventAfterClosingTime();
                return;
            }
            if (!await this.isTreatmentDurationValid()) {
                this.messageOverlappingEvents();
                return;
            }
            if (animalID) {
                let docRef = await addDoc(this.getEventRef(), this.event.toEventJson());
                await updateDoc(doc(this.getEventRef(), docRef.id), { id: docRef.id });
                this.dialogRef.close({ ...this.event.toEventJson(), id: docRef.id });
                const endTime = performance.now(); // Endzeit messen
                const duration = endTime - startTime; // Dauer berechnen

                console.log(`Terminerstellung dauerte ${duration} Millisekunden.`);
                this.loading = false;      
            } 
        }
       
    }

    prepareEventData(selectedTreatment: TreatmentsSelection, animalID: any) {
        this.event.animalID = animalID;
        this.event.treatmentName = selectedTreatment.name;
        this.event.categoryColor = selectedTreatment.categoryColor;
        this.event.duration = selectedTreatment.duration;
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


    findAnimalIDByName(animalName: string): string | undefined {
        let foundAnimal = this.animalList.find((animal: Animals) => animal.name === animalName);
        return foundAnimal ? foundAnimal.id : undefined;
    }

    isEventAfterClosingTime(): boolean {
        let endHour = this.calculateEndTime(this.event.hour, this.event.duration);
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
        await this.getExistingEventsForDay(this.event.day);
      
        let newEndHour = this.calculateEndTime(this.event.hour, this.selectedTreatment.duration);
      
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
            where('day', '<', this.event.day)
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

    async subAnimalListAndSubscribe() {
        let updateAnimalList = (snapshot: QuerySnapshot) => {
          this.animalList = [];
    
          snapshot.forEach((userDoc) => {
            let userData = userDoc.data();
            if (userData && userData["animals"]) {
              let userAnimals = userData["animals"].map((animalData: any) => {
                return new Animals().setAnimalObject(animalData, animalData.id);
              });
              this.animalList.push(...userAnimals);
            }
          });
        };
    
        let usersSnapshot = await getDocs(this.getUserRef());
        updateAnimalList(usersSnapshot);
    
        return onSnapshot(this.getUserRef(), (updatedUsersSnapshot) => {
            updateAnimalList(updatedUsersSnapshot);
        });
    }
    
    getUserRef() {
        return collection(this.firestore, 'users');
    }

    getEventRef() {
        return collection(this.firestore, 'events');
    }
}