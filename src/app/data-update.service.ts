import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Events } from './models/events.class';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';



@Injectable({
  providedIn: 'root',
})
export class DataUpdateService {
    firestore: Firestore = inject(Firestore);
    private userDataSubject = new BehaviorSubject<any>({});
    private animalDataSubject = new BehaviorSubject<any>({});
    userData$ = this.userDataSubject.asObservable();
    animalData$ = this.animalDataSubject.asObservable();
    eventsList: Events[] = [];

    setUserData(updatedData: any): void {
        const currentData = this.userDataSubject.value;
        const newData = { ...currentData, ...updatedData };
        this.userDataSubject.next(newData);
    }

    getUserData() {
      return this.userDataSubject.value;
    }

    setAnimalData(updatedData: any): void {
        const currentData = this.animalDataSubject.value;
        const newData = { ...currentData, ...updatedData };
        this.animalDataSubject.next(newData);
    }
  
    getAnimalData() {
        return this.animalDataSubject.value;
    }

    getAllEvents(): void {
        onSnapshot(collection(this.firestore, 'events'), (list) => {
          this.eventsList = [];
            list.forEach((element) => {
              this.eventsList.push(new Events().setEventsObject(element.data(), element.id));
            });
        });
    }

}

