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
    unsubList;
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
              this.userList.push(new User().setUserObject(element.data(), element.id));
              this.filteredUser = this.userList;
            });
        }) 
    }

    ngOnDestroy(){
        this.unsubList();
    }

    getUserRef() {
        return collection(this.firestore, 'users');
    }

    addUser() {
        this.dialog.open(DialogAddUserComponent);
    }

    filterUser() {
        this.filteredUser = this.inputValue ? this.userList.filter((item: any) => this.compareInputUser(item)) : this.userList;
    }

    compareInputUser(item: any) {
        return item.firstName.toLowerCase().substring(0, this.inputValue.length) == this.inputValue.toLowerCase() ||
          item.lastName.toLowerCase().substring(0, this.inputValue.length) == this.inputValue.toLowerCase() ||
          item.city.toLowerCase().substring(0, this.inputValue.length) == this.inputValue.toLowerCase();
    } 
} 