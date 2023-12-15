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
    { value: 'Guinea pig', viewValue: 'Guinea pig' },
    { value: 'Ferret', viewValue: 'Ferret' },
    { value: 'Mouse/Rat', viewValue: 'Mouse/Rat' },
  ];
  genders: string[] = ['Female', 'Male'];

  firestore: Firestore = inject(Firestore);
  user!: User;
  animal = new Animals();
  loading = false;
  hideRequired = 'true';
  birthDate!: Date;
  selectedAnimal!: string;
  selectedGender!: string;
  userId: any = '';
 
  constructor(public dialogRef: MatDialogRef<DialogAddAnimalComponent>) {}


  async saveAnimal() {
      this.animal.birthDate = this.birthDate.getTime();
      this.animal.gender = this.selectedGender;
      this.animal.species = this.selectedAnimal;
      this.loading = true;
      
      this.user.animals.push(new Animals(this.animal.toJsonAnimals()));
      
      await updateDoc(this.getUserID(), this.user.toJson()).then(() => {
          this.loading = false; 
          this.dialogRef.close();
      }); 
  }

  getUserID() {
      return doc(collection(this.firestore, 'users'), this.user.id);
  }

  limitLength(event: any) {
    const maxLength = 15;
      if (event.target.value.length > maxLength) {
          event.target.value = event.target.value.slice(0, maxLength);
      }
    }

}