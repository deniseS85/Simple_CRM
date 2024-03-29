import { Component, ViewChild, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { collection, addDoc } from "firebase/firestore"; 
import { MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

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
  hideRequired ="true";
  @ViewChild('addUserForm') addUserForm!: NgForm;

  constructor(public dialogRef: MatDialogRef<DialogAddUserComponent>) {}
  
  async saveUser() {
      this.user.birthDate = this.birthDate.getTime();
      this.loading = true;
      let docRef = await addDoc(this.getUserRef(), this.user.toJson());
      await updateDoc(doc(this.getUserRef(), docRef.id), {id: docRef.id});
      this.loading = false;
      this.dialogRef.close({ ...this.user.toJson(), id: docRef.id });
  }

  getUserRef() {
      return collection(this.firestore, 'users');
  }
}