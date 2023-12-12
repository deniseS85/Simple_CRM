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
    { value: 'cat-0', viewValue: 'Cat' },
    { value: 'dog-1', viewValue: 'Dog' },
    { value: 'hamster-2', viewValue: 'Hamster' },
    { value: 'rabbit-3', viewValue: 'Rabbit' },
    { value: 'guineapig-4', viewValue: 'Guinea pig' },
    { value: 'ferret-5', viewValue: 'Ferret' },
    { value: 'mouserat-6', viewValue: 'Mouse/Rat' },
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
     
      await updateDoc(this.getUserID(), { animals: this.user.animals }).then(() => {
          this.loading = false; 
          this.dialogRef.close();
      }); 
  }
  
  getUserID() {
      return doc(collection(this.firestore, 'users'), this.user.id);
  }

}