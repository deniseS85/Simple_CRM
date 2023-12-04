import { Component } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, addDoc } from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';

@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss'
})
export class DialogAddUserComponent {

  user = new User();
  birthDate!: Date;
  loading = false;

  constructor(private firestore: Firestore) {}

  saveUser() {
    console.log('user', this. user);
    this.user.birthDate = this.birthDate.getTime();
    this.loading = true;

    this.firestore
   /*  .collection('users')
    .add(this.user.toJson())
    .then((result: any) {
      console.log(result)
    }); */

  }

}