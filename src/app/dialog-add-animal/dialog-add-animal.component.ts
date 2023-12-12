import { Component, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, updateDoc } from '@angular/fire/firestore';
import { Animals } from '../models/animals.class';
import { User } from '../models/user.class';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

interface Animal {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-dialog-add-animal',
  templateUrl: './dialog-add-animal.component.html',
  styleUrls: ['./dialog-add-animal.component.scss']
})
export class DialogAddAnimalComponent {
  animals: Animal[] = [
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
  animal = new Animals();
  loading = false;
  hideRequired = 'true';
  birthDate!: Date;
  selectedAnimal!: string;
  selectedGender!: string;
  userId: any = '';
  user!: User;

  constructor(private router: Router, public dialogRef: MatDialogRef<DialogAddAnimalComponent>) {}

  async saveAnimal() {
   /*  this.getUserId(); 
  
    this.user.animals[animals.id] = this.animal.toJsonAnimals();
  
    
    try {
      await updateDoc(doc(this.firestore, 'users', this.userId), { animals: this.user.animals });
      this.loading = false;
      this.dialogRef.close();
    } catch (err) {
      console.error('Fehler beim Hinzufügen des Tiers:', err);
      this.loading = false;
    } */
  }
  
  
  getUserId() {
    const currentUrl = this.router.url;
    const userIdMatch = currentUrl.match(/\/patients\/([^\/]+)/);
  
    if (userIdMatch && userIdMatch[1]) {
      const userId = userIdMatch[1];
      this.userId = userId;
    }
  }
  

 /*  getUserID() {
    return (collection(this.firestore, 'users'), this.userId);
  } */

  

  getAnimalRef() {
      return collection(this.firestore, 'users', this.userId, 'animals');
  }

}



