import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user.class';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditUserComponent } from '../dialog-edit-user/dialog-edit-user.component';
import { DialogEditAddressComponent } from '../dialog-edit-address/dialog-edit-address.component';
import { DialogAddAnimalComponent } from '../dialog-add-animal/dialog-add-animal.component';
import { Animals } from '../models/animals.class';


@Component({
    selector: 'app-user-detail',
    templateUrl: './user-detail.component.html',
    styleUrl: './user-detail.component.scss'
})
 
export class UserDetailComponent {
    firestore: Firestore = inject(Firestore);
    user = new User();
    animal = new Animals();
    userID: any;
    userList;

    constructor(private router: Router, private route: ActivatedRoute, public dialog: MatDialog) {
        this.userID = this.route.snapshot.paramMap.get('id');
        this.userList = this.getUserfromFirebase();
    }
 
    ngOnDestroy(){
        this.userList();
    }

    getUserID() {
        return doc(collection(this.firestore, 'users'), this.userID);
    }

    getUserfromFirebase() {
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
        this.router.navigate(['patients']);
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

    addAnimal() {
        const dialog = this.dialog.open(DialogAddAnimalComponent);
        dialog.componentInstance.user = new User(this.user.toJson());
    }

    getAnimals(): Animals[] {
            return Array.isArray(this.user.animals) ? this.user.animals : [this.user.animals];
    }

    getAge(birthday: number) {
        let today = new Date();
        let birthDate = new Date(birthday);
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();
    
        if (years === 0) {
            if (months === 0) {
                return `${days} Days`;
            } else {
                return `${months} Month`;
            }
        } else {
            return `${years} Years`;
        }
    }
}