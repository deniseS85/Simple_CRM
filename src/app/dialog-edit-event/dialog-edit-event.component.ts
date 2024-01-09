import { Component, Inject, inject } from '@angular/core';
import { Animals } from '../models/animals.class';
import { Firestore, addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataUpdateService } from '../data-update.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkflowItem } from '../models/workflow.class';
import { User } from '../models/user.class';

interface TreatmentsSelection {
  name: string;
  categoryColor: string;
  duration: number;
}

@Component({
  selector: 'app-dialog-edit-event',
  templateUrl: './dialog-edit-event.component.html',
  styleUrl: './dialog-edit-event.component.scss'
})
export class DialogEditEventComponent {
  treatments: TreatmentsSelection[] = [ 
    { name: 'Medical Check-Up ', categoryColor: '#c9f7f9', duration: 2},
    { name: 'Dental Care', categoryColor: '#fbd1d1', duration: 1 },
    { name: 'Vaccination', categoryColor: '#eec3fd', duration: 1},
    { name: 'Castration', categoryColor: '#d4f9c6', duration: 2},
    { name: 'Laboratory Test', categoryColor: '#f9f6c3', duration: 1},
    { name: 'Operation', categoryColor: '#DBDBDB', duration: 3},
];
  firestore: Firestore = inject(Firestore);
  user = new User();
  animal = new Animals();
  loading = false;
  hideRequired = 'true';
  selectedDate: Date;
  selectedHour: string;
  hours: string[] = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']; 
  animalList:any = [];
  unsubList;
  isConfirmationVisible = false;
  selectedTreatment!:any;
  usersList:any = [];
  unsubUser:any = [];
  workflowCompleteData: { lastName: string, img: string } = { lastName: '', img: '' };
  existingEventsArray: any[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public event: any, private dataUpdate: DataUpdateService, public dialogRef: MatDialogRef<DialogEditEventComponent>, private snackBar: MatSnackBar) {
      this.unsubList = this.subAnimalList();
      this.unsubUser = this.subUsersList();
      this.selectedDate = event.day;
      this.selectedHour = event.hour;
  }
  
    ngOnDestroy() {
        this.unsubList(); 
        this.unsubUser();
    }

    async saveChangeEvent() {
        this.loading = true;

        if (this.isEventValid()) {
            let selectedTreatment = this.getSelectedTreatment();

            if (selectedTreatment) {
                this.selectedTreatment = selectedTreatment;
                let updatedEventData = this.getUpdatedEventData(selectedTreatment);
                let workflowCompleteData = await this.loadUserData(updatedEventData);

                if (this.isEventAfterClosingTime(selectedTreatment.duration, this.selectedHour)) {
                    this.messageEventAfterClosingTime();
                    return;
                }
                if (!await this.isTreatmentDurationValid()) {
                    this.messageOverlappingEvents();
                    return;
                }
                this.updateEventAndWorkflow(updatedEventData, workflowCompleteData);
                this.dialogRef.close();
                this.loading = false;
            }
        }
    }
    
    isEventValid(): boolean {
        return this.event.id && this.event.day && this.event.hour && this.event.name && this.event.treatmentName;
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

    getSelectedTreatment(): TreatmentsSelection | undefined {
        return this.treatments.find(treatment => treatment.name === this.event.treatmentName);
    }

    getUpdatedEventData(selectedTreatment: TreatmentsSelection): any {
        let { name, categoryColor, duration } = selectedTreatment;
        let updatedAnimalID = '';
    
        this.animalList.forEach((animal: Animals) => {
            if (animal.name === this.event.name) {
                updatedAnimalID = animal.id;
            }
        });
        
        return {
            animalID: updatedAnimalID,
            name: this.event.name,
            treatmentName: name,
            categoryColor: categoryColor,
            day: this.selectedDate,
            hour: this.selectedHour,
            duration: duration
        }; 
    }

    getUpdateWorkflowData(selectedTreatment: TreatmentsSelection): any {
        let { name } = selectedTreatment;
    
        return {
            name: this.event.name,
            treatmentName: name,
            day: this.selectedDate,
            hour: this.selectedHour,
            id: this.event.id,
            img: this.workflowCompleteData.img || '',
            lastName: this.workflowCompleteData.lastName || '',
        };

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

    updateEventAndWorkflow(updatedEventData: any, workflowCompleteData: any): void {
        let eventId = this.event.id;

        updateDoc(this.getEventID(), updatedEventData).then(() => {
            let updatedWorkflowData = this.getUpdateWorkflowData(this.getSelectedTreatment()!);

            if (Object.keys(updatedWorkflowData).length > 0) {
                let workflowItem = new WorkflowItem().setWorkflowItemObject(updatedWorkflowData, eventId);
                this.updateWorkflowDatabase(workflowItem, eventId, workflowCompleteData);
            }
            this.dialogRef.close();
            this.loading = false;
        });
    }

    async updateWorkflowDatabase(item: WorkflowItem, eventId: string, workflowInklNameImg: any): Promise<void> {
        try {
            let workflowRef = collection(this.firestore, 'workflow');
            let querySnapshot = await getDocs(query(workflowRef, where('id', '==', eventId)));
                
            if (querySnapshot.size > 0) {
                let existingWorkflowItem = querySnapshot.docs[0];
                let existingEventDate = existingWorkflowItem.data()?.["day"]?.toDate() || null;
    
                let existingEventDateMidnight = existingEventDate ? new Date(existingEventDate) : null;
                if (existingEventDateMidnight) {
                    existingEventDateMidnight.setHours(0, 0, 0, 0);
                }
    
                let selectedDateMidnight = new Date(this.selectedDate);
                selectedDateMidnight.setHours(0, 0, 0, 0);
                if (existingEventDateMidnight && existingEventDateMidnight.getTime() !== selectedDateMidnight.getTime()) {
                    await deleteDoc(existingWorkflowItem.ref);
                } else {
                    let cleanData = this.cleanZoneProperties({ ...item.toJson(), ...workflowInklNameImg });
                    await updateDoc(existingWorkflowItem.ref, cleanData);
                }
            } else {
                if (this.event.id && this.event.day && this.event.hour) {
                    await addDoc(workflowRef, { ...item.toJson(), ...this.workflowCompleteData });
                }
            }
        } catch (error) {
            console.error('Error adding or updating workflow item: ', error);
        }
    }

    cleanZoneProperties(data: any): any {
        const cleanData: any = {};
    
        Object.keys(data).forEach(key => {
            if (!key.startsWith('__zone_symbol__')) {
                cleanData[key] = data[key];
            }
        });
    
        return cleanData;
    }

    subUsersList() {
        return onSnapshot(this.getUsersRef(), (list) =>{
            this.usersList = [];
            list.forEach(element => {
                this.usersList.push(new User().setUserObject(element.data(), element.id));
            });
            
        });
    }

    getUsersRef() {
        return collection(this.firestore, 'users');
    }

    getWorkflowRef() {
        return collection(this.firestore, 'workflow');
    }

    async loadUserData(updatedEventData: any): Promise<any> {
        this.workflowCompleteData = { lastName: '', img: '' };
    
        await Promise.all(this.usersList.map(async (user: User) => {
            for (const animal of user.animals) {
              if (animal.name === updatedEventData.name) {
                let imgPath = `./assets/img/${animal.species}.png`;
      
                this.workflowCompleteData = {
                  lastName: user.lastName,
                  img: imgPath
                };
                break;
              }
            }
          }));
          return this.workflowCompleteData;
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

    calculateStartTime(endTime: string, duration: number) {
        let endHour = parseInt(endTime.split(':')[0], 10);
        let startHour = endHour + 1 - duration;
    
        return `${startHour.toString().padStart(2, '0')}:00`;
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
        this.loading = true;
        deleteDoc(this.getEventID()).then(async () => {
            let querySnapshot = await getDocs(query(this.getWorkflowRef(), where('id', '==', this.event.id)));

            if (querySnapshot.size > 0) {
                let existingWorkflowItem = querySnapshot.docs[0];
                await deleteDoc(existingWorkflowItem.ref);
            }
            this.dialogRef.close();
            this.loading = false;
        }).catch((error) => {
            console.error('Error deleting event from Firebase: ', error);
        });
        this.isConfirmationVisible = false;
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
