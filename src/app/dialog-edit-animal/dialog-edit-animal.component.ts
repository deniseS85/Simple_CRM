import { Component, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Animals } from '../models/animals.class';
import { Firestore, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { collection, doc } from '@angular/fire/firestore';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

interface Species {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-dialog-edit-animal',
  templateUrl: './dialog-edit-animal.component.html',
  styleUrl: './dialog-edit-animal.component.scss'
})
export class DialogEditAnimalComponent  {
  animals: Species[] = [
    { value: 'Cat', viewValue: 'Cat' },
    { value: 'Dog', viewValue: 'Dog' },
    { value: 'Hamster', viewValue: 'Hamster' },
    { value: 'Rabbit', viewValue: 'Rabbit' },
    { value: 'Guinea pig', viewValue: 'Guinea pig' },
    { value: 'Ferret', viewValue: 'Ferret' },
    { value: 'Mouse/Rat', viewValue: 'Mouse/Rat' },
  ];
  genders: string[] = ['Female', 'Male'];
  firestore: Firestore = inject(Firestore);
  loading =  false;
  animal!: Animals;
  birthDate: any;
  selectedAnimal!: string;
  selectedGender!: string;

  constructor(public dialogRef: MatDialogRef<DialogEditAnimalComponent>) {
  
  }

  async saveAnimalChange() {
    /* this.animal.birthDate = this.birthDate.getTime();
    this.animal.gender = this.selectedGender;
    this.animal.species = this.selectedAnimal;
      this.loading = true;
      await updateDoc(this.getAnimalID(), this.animal.toJsonAnimals()).then(() => {
        this.loading = false;
        this.dialogRef.close();
      });  */
  }

 /*  getAnimalID() {
      return doc(collection(this.firestore, 'animals'), this.animal.id);
  } */

  limitLength(event: any) {
    const maxLength = 15;
      if (event.target.value.length > maxLength) {
          event.target.value = event.target.value.slice(0, maxLength);
      }
    }

 

}
