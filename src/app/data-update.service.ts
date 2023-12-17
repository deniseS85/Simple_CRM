// In DataUpdateService
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Animals } from './models/animals.class'; // Stelle sicher, dass der Import korrekt ist

@Injectable({
  providedIn: 'root',
})
export class DataUpdateService {
  private selectedAnimalSource = new BehaviorSubject<Animals | null>(null);
  selectedAnimal$ = this.selectedAnimalSource.asObservable();

  updateSelectedAnimal(animal: Animals) {
    this.selectedAnimalSource.next(animal);
  }
}
