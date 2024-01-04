import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Events } from './models/events.class';
import { Firestore, collection, onSnapshot, query, where } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root',
})
export class DataUpdateService {
    firestore: Firestore = inject(Firestore);
    private userDataSubject = new BehaviorSubject<any>({});
    private animalDataSubject = new BehaviorSubject<any>({});
    private animalEventsListSubject = new BehaviorSubject<Events[]>([]);
    private allAnimalIdsSubject = new BehaviorSubject<string[]>([]);
    private eventsListSubject = new BehaviorSubject<Events[]>([]);
    userData$ = this.userDataSubject.asObservable();
    animalData$ = this.animalDataSubject.asObservable();
    animalEventsList$ = this.animalEventsListSubject.asObservable();
    allAnimalIds$ = this.allAnimalIdsSubject.asObservable();
    eventsList$ = this.eventsListSubject.asObservable();
   
    

    setUserData(updatedData: any): void {
        const currentData = this.userDataSubject.value;
        const newData = { ...currentData, ...updatedData };
        this.userDataSubject.next(newData);
    }

    getUserData() {
        return this.userDataSubject.value;
    }

    setAnimalData(updatedData: any): void {
        let currentData = this.animalDataSubject.value;
        let newData = { ...currentData, ...updatedData };
        this.animalDataSubject.next(newData);
    }
  
    getAnimalData() {
        return this.animalDataSubject.value;
    }

    getAllEvents(): void {
        onSnapshot(collection(this.firestore, 'events'), (list) => {
          const eventsList: Events[] = [];
            list.forEach((element) => {
              eventsList.push(new Events().setEventsObject(element.data(), element.id));
            });
            this.eventsListSubject.next(eventsList);
        });
    }

    setAnimalEventsList(updatedList: Events[]): void {
        this.animalEventsListSubject.next(updatedList);
    }

    getAllEventsForAnimal(animalId: string): void {
        let eventsRef = collection(this.firestore, 'events');
        let animalEventsQuery = query(eventsRef, where('animalID', '==', animalId));

        onSnapshot(animalEventsQuery, (list) => {

          let animalEventsList: Events[] = [];
          list.forEach((element) => {
              let eventObject: Events = new Events().setEventsObject(element.data(), element.id);
              animalEventsList.push(eventObject);
          });
  
          this.setAnimalEventsList(animalEventsList);
        });
    }

    getAllAnimalIds(): void {
        const eventsRef = collection(this.firestore, 'events');

        onSnapshot(eventsRef, (list) => {
            const uniqueAnimalIds = new Set<string>();

            list.forEach((element) => {
                const event: Events = new Events().setEventsObject(element.data(), element.id);
                uniqueAnimalIds.add(event.animalID);
            });

            let animalIdsArray = Array.from(uniqueAnimalIds);
            this.allAnimalIdsSubject.next(animalIdsArray);
        });
    }
}

   


