import { Component, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore } from '@angular/fire/firestore';
import { collection, addDoc } from "firebase/firestore"; 
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss'
})
export class DialogAddUserComponent {

  user = new User();
  birthDate!: Date;
  loading = false;
  firestore: Firestore = inject(Firestore);
  hideRequired="true";

  constructor(public dialogRef: MatDialogRef<DialogAddUserComponent>) {}
  
   async saveUser() {
      this.user.birthDate = this.birthDate.getTime();
      this.loading = true;

      await addDoc(this.getUserRef(), this.user.toJson()).catch(
        (err) => {
          console.error(err)
        }
      ).then(() => { 
        this.loading = false; 
        this.dialogRef.close();
      })
  }


  getUserRef() {
      return collection(this.firestore, 'users');
  }
}