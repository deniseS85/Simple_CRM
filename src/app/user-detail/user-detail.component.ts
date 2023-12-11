import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user.class';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditUserComponent } from '../dialog-edit-user/dialog-edit-user.component';
import { DialogEditAddressComponent } from '../dialog-edit-address/dialog-edit-address.component';


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

  constructor(private router: Router, private route: ActivatedRoute, public dialog: MatDialog) {
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

  async deleteUser() {
      await deleteDoc(this.getUserID()).catch(
          (err) => { console.error(err); }
      );
      this.navigateToUserList();
  }

  navigateToUserList() {
      this.router.navigate(['user']);
  }

  editUser() { 
      const dialog = this.dialog.open(DialogEditUserComponent);
      /* Kopie vom Objekt erstellen, damit es nicht gleich überschrieben wird, sondern erst beim speichern */
      dialog.componentInstance.user = new User(this.user.toJson()); 
  }

  editAddress() {
      const dialog = this.dialog.open(DialogEditAddressComponent);
      dialog.componentInstance.user = new User(this.user.toJson());
  }
}
