import { Component, inject } from '@angular/core';
import { Firestore, collection, doc, updateDoc} from '@angular/fire/firestore';
import { Animals } from '../models/animals.class';
import { User } from '../models/user.class';
import { MatDialogRef } from '@angular/material/dialog';

interface Species {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-dialog-add-animal',
  templateUrl: './dialog-add-animal.component.html',
  styleUrls: ['./dialog-add-animal.component.scss']
})

export class DialogAddAnimalComponent {
  animals: Species[] = [
    { value: 'Cat', viewValue: 'Cat' },
    { value: 'Dog', viewValue: 'Dog' },
    { value: 'Hamster', viewValue: 'Hamster' },
    { value: 'Rabbit', viewValue: 'Rabbit' },
    { value: 'Guinea pig', viewValue: 'Guinea pig'},
    { value: 'Ferret', viewValue: 'Ferret' },
    { value: 'Rat', viewValue: 'Rat' },
  ];
  genders: string[] = ['Female', 'Male'];
  firestore: Firestore = inject(Firestore);
  user!: User;
  animal = new Animals();
  loading = false;
  hideRequired = 'true';
  birthDate!: Date;
  selectedSpecies!: string;
  selectedGender!: string;
 
  constructor(public dialogRef: MatDialogRef<DialogAddAnimalComponent>) {}

  
  async addAnimal() {
      this.animal.birthDate = this.birthDate.getTime();
      this.animal.gender = this.selectedGender;
      this.animal.species = this.selectedSpecies;
      this.loading = true;
      
      let newAnimal = new Animals(this.animal.toJsonAnimals());
      newAnimal.generateUniqueId(); 

      this.user.animals.push(newAnimal);
      
      await updateDoc(this.getUserID(), this.user.toJson()).then(() => {
          this.loading = false; 
          this.dialogRef.close();
      }); 
  }

  getUserID() {
      return doc(collection(this.firestore, 'users'), this.user.id);
  }

  limitLength(event: any) {
      let maxLength = 15;
        if (event.target.value.length > maxLength) {
            event.target.value = event.target.value.slice(0, maxLength);
        }
      }
}