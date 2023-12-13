import { Component, HostListener, OnInit, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import { collection, doc } from 'firebase/firestore';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-dialog-edit-user',
  templateUrl: './dialog-edit-user.component.html',
  styleUrl: './dialog-edit-user.component.scss'
})

export class DialogEditUserComponent implements OnInit {

  firestore: Firestore = inject(Firestore);
  loading =  false;
  user!: User;
  birthDate: any;
  

  constructor(public dialogRef: MatDialogRef<DialogEditUserComponent>) {}

  ngOnInit(): void {
      this.birthDate = new Date(this.user.birthDate);
  }
  
  async saveUserChange() {
      this.loading = true;
      await updateDoc(this.getUserID(), this.user.toJson()).then(() => {
          this.loading = false;
          this.updateUserNameInLocalStorage();
          this.dialogRef.close();
      }); 
  }

  updateUserNameInLocalStorage() {
        let userName = this.user.firstName + ' ' + this.user.lastName;
        localStorage.setItem('userName', userName);
  }

  getUserID() {
      return doc(collection(this.firestore, 'users'), this.user.id);
  }
}
