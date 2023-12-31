import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, updateDoc, Timestamp } from '@angular/fire/firestore';
import { Animals } from '../models/animals.class';
import { User } from '../models/user.class';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditAnimalComponent } from '../dialog-edit-animal/dialog-edit-animal.component';
import { DataUpdateService } from '../data-update.service';
import { Events } from '../models/events.class';

@Component({
    selector: 'app-animal-detail',
    templateUrl: './animal-detail.component.html',
    styleUrl: './animal-detail.component.scss'
})
export class AnimalDetailComponent implements OnInit{
    firestore: Firestore = inject(Firestore);
    user = new User();
    animal = new Animals();
    userID: any;
    animalNameUrl: any;
    animalList: Animals[] = [];
    unsubAnimalList;
    selectedAnimal:any = '';
    lastAppointment: string = '';
    nextAppointment: string = '';
    animalIds: any[] = [];
    treatments: any[] = [];

    constructor(private route: ActivatedRoute, private router: Router, public dialog: MatDialog, private dataUpdate: DataUpdateService) {
        this.userID = this.route.snapshot.paramMap.get('id');
        this.animalNameUrl = this.route.snapshot.paramMap.get('animal');
        this.unsubAnimalList = this.getAnimalfromUser();
    }

    ngOnInit(): void {
        this.loadSelectedAnimal();
        this.loadAppointments();
    }

    ngOnDestroy(){
        this.unsubAnimalList();
    }

    loadSelectedAnimal(): void {
        let storedAnimalData = localStorage.getItem('selectedAnimal');
        if (storedAnimalData) {
            this.selectedAnimal = JSON.parse(storedAnimalData);
        } else {
            this.getSelectedAnimalFromUser();
        }
        this.dataUpdate.getAllAnimalIds();

        this.dataUpdate.allAnimalIds$.subscribe((animalIds) => {
            this.animalIds = animalIds;
        });
    }

    getEventRef() {
        return collection(this.firestore, 'events');
    }

    getUserID() {
        return doc(collection(this.firestore, 'users'), this.userID);
    }

    getAnimalfromUser() {
        return onSnapshot(this.getUserID(), (element) => {
            this.user = new User(element.data());
            this.animalList = this.user.animals;
            this.getSelectedAnimalFromUser();
        });
    }

    getSelectedAnimalFromUser() {
        for (let i = 0; i < this.animalList.length; i++) {
            let animals = this.animalList[i];

            if (animals.name === this.animalNameUrl) {
                this.selectedAnimal = animals;
                
                this.dataUpdate.animalData$.subscribe(updatedAnimal => {
                    if (updatedAnimal && updatedAnimal.id === this.selectedAnimal.id) {
                      this.selectedAnimal = updatedAnimal;
                      localStorage.setItem('selectedAnimal', JSON.stringify(updatedAnimal));
                    }
                });
                return this.selectedAnimal;
            }
        }
    }

    loadAppointments() {
        onSnapshot(this.getEventRef(), (querySnapshot) => {
            let animalEventsList: Events[] = [];
    
            querySnapshot.forEach((doc) => {
                animalEventsList.push(new Events().setEventsObject(doc.data(), doc.id));
            });
    
            let validEvents = animalEventsList.filter(event => event.animalID === this.selectedAnimal.id);
            let sortedEvents = validEvents.sort((a, b) => b.day.getTime() - a.day.getTime());
    
            this.treatments = sortedEvents.map(event => ({
                date: this.formatDate(event.day),
                treatment: event.treatmentName
            }));
    
            this.updateAppointmentDates(sortedEvents);
        });
    }

    updateAppointmentDates(animalEventsList: Events[]) {
        let validEvents = animalEventsList.filter(event => event.day instanceof Date && event.animalID === this.selectedAnimal.id);
        let sortedEvents = validEvents.sort((a, b) => a.day.getTime() - b.day.getTime());
    
        let today = new Date();
        today.setHours(0, 0, 0, 0);
    
        let lastAppointmentEvent = sortedEvents.find(event => event.day < today);
        let nextAppointmentEvent = sortedEvents.find(event => event.day >= today);
    
        this.lastAppointment = lastAppointmentEvent ? this.formatDate(lastAppointmentEvent.day) : '---';
    
        if (nextAppointmentEvent !== undefined) {
            if (this.isToday(nextAppointmentEvent.day)) {
                this.nextAppointment = 'Today';
            } else {
                this.nextAppointment = this.formatDate(nextAppointmentEvent.day);
            }
        } else {
            this.nextAppointment = '---';
        }
    }
    
    isToday(date: Date): boolean {
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
    }

    formatDate(date: Date): string {
        let day = date.getDate().toString().padStart(2, '0');
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let year = date.getFullYear();
        
        return `${day}.${month}.${year}`;
    }
    
    toEventDate(timestamp: any): Date | null {
        return timestamp instanceof Timestamp ? new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6) : null;
    }
    
    goBack() {
        let userId = this.route.snapshot.paramMap.get('id');
        this.router.navigate(['/patients', userId]);
    }

    async deleteAnimal() {
        if (this.selectedAnimal) {
            this.animalList = this.user.animals.filter(animal => animal.id !== this.selectedAnimal.id);
    
            await updateDoc(this.getUserID(), {
                animals: this.animalList.map(animal => animal.toJsonAnimals())
            });
            this.navigateToUser();
        }
    }

    navigateToUser() {
        this.router.navigate(['patients/' + this.userID]);
    }

    editAnimal() {
        let dialog = this.dialog.open(DialogEditAnimalComponent, {
            data: { animal: this.selectedAnimal }
        });
        dialog.componentInstance.user = new User(this.user.toJson());
    }
}


