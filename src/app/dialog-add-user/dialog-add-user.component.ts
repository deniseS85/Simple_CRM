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

  constructor(public dialogRef: MatDialogRef<DialogAddUserComponent>) {}

   async saveUser() {
      console.log('user', this. user);
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

    
  


   /*  this.firestore */
    /* .collection('user')
    .add(this.user.toJson())
    .then((result: any) {
      console.log(result)
    }); */

  }

  getUserRef(){
    return collection(this.firestore, 'users');
  }

}