import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../models/user.class';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot, doc } from 'firebase/firestore';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
 
export class UserDetailComponent {

  firestore: Firestore = inject(Firestore);
  user = new User();
  userID: any;
  userList;

  constructor(private route: ActivatedRoute) {
    this.userID = this.route.snapshot.paramMap.get('id');
    this.userList = this.getUserIDfromFirebase();
  }
 
  ngOnDestroy(){
      this.userList();
  }

  getUserID() {
      return doc(collection(this.firestore, 'users'),this.userID);
  }

  getUserIDfromFirebase() {
      return onSnapshot(this.getUserID(), (element) => {
          this.user = new User(element.data());
          this.user.id = this.userID;
      });
  }
}
