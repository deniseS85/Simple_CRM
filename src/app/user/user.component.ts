import { Component, inject } from '@angular/core';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../models/user.class';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot } from 'firebase/firestore';
import { UserTableService } from '../user-table.service';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  firestore: Firestore = inject(Firestore);
  user = new User();
  unsubList;

  constructor(public dialog: MatDialog, public userTableService: UserTableService) {
        this.unsubList = this.subUsersList();
  }

  subUsersList() {
      return onSnapshot(this.getUserRef(), (list) =>{
          this.userTableService.userList = [];
          list.forEach(element => {
            this.userTableService.userList.push(this.setUserObject(element.data(), element.id));
          });
      })
  }

  setUserObject(obj:any, id:string) {
      return {
        id: id || "",
        firstName: obj.firstName || "",
        lastName: obj.lastName || "",
        email: obj.email || "",
        birthDate: obj.birthDate || 0,
        street: obj.street || "",
        postCode: obj.postCode || "",
        city: obj.city || ""
      }
  }

  ngOnDestroy(){
      this.unsubList();
  }

  getUserRef() {
      return collection(this.firestore, 'users');
  }

  openDialog() {
      this.dialog.open(DialogAddUserComponent);
  }
}