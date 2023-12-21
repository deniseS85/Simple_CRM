// In DataUpdateService
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class DataUpdateService {
    private userDataSubject = new BehaviorSubject<any>({});
    private animalDataSubject = new BehaviorSubject<any>({});
    userData$ = this.userDataSubject.asObservable();
    animalData$ = this.animalDataSubject.asObservable();
    private events: any[] = [];
    private eventIdCounter: number = 1;

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

    addEvent(event: any) {
        event.id = this.eventIdCounter++;
        this.events.push(event);
    }

    getEvents() {
        return this.events;
    }
}

