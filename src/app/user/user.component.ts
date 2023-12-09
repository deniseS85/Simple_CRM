import { Component, Input, inject } from '@angular/core';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../models/user.class';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot } from 'firebase/firestore';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  firestore: Firestore = inject(Firestore);
  user = new User();
  unsubList;
  isUser = false;
  userList:any = [];
  @Input() inputValue!: string;
  filteredUser!: any[];
  
  constructor(public dialog: MatDialog) {
        this.unsubList = this.subUsersList();
  }

  subUsersList() {
      return onSnapshot(this.getUserRef(), (list) =>{
          this.userList = [];
          list.forEach(element => {
            this.userList.push(this.setUserObject(element.data(), element.id));
            this.filteredUser = this.userList;
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

  filterUser() {
      if (this.inputValue) {
          this.filteredUser = this.userList.filter((item: any) => this.compareInputUser(item));
      } else {
          this.filteredUser = this.userList;
      }
  }


  compareInputUser(item: any) {
      return item.firstName.toLowerCase().substring(0, this.inputValue.length) == this.inputValue.toLowerCase() ||
        item.lastName.toLowerCase().substring(0, this.inputValue.length) == this.inputValue.toLowerCase() ||
        item.city.toLowerCase().substring(0, this.inputValue.length) == this.inputValue.toLowerCase();
  } 
} 
