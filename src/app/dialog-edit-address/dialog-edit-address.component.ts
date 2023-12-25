import { Component, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import { collection, doc } from 'firebase/firestore';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-address',
  templateUrl: './dialog-edit-address.component.html',
  styleUrl: './dialog-edit-address.component.scss'
})
export class DialogEditAddressComponent {

  firestore: Firestore = inject(Firestore);
  loading =  false;
  user!: User;

  constructor(public dialogRef: MatDialogRef<DialogEditAddressComponent>) {}

  async saveUserChange() {
      this.loading = true;
      await updateDoc(this.getUserID(), this.user.toJson()).then(() => {
          this.loading = false; 
          this.dialogRef.close();
      });
  }

  getUserID() {
      return doc(collection(this.firestore, 'users'), this.user.id);
  }
}
