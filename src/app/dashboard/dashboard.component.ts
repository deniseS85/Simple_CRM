import { Component, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { Events } from '../models/events.class';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent  {
  firestore: Firestore = inject(Firestore);
  userList:any = [];
  unsubUserList;
  unsubEventList;
  eventsList:any[] = [];
  monthlyEvents:any[] = [];
  statistic!: number;
  eventsByMonth: Record<string, number> = {};

  constructor() {
      this.unsubUserList = this.subUsersList();
      this.unsubEventList = this.subEventsList();
  }

  

  subUsersList() {
      return onSnapshot(this.getUserRef(), (list) =>{
          this.userList = [];
          list.forEach(element => {
              this.userList.push(new User().setUserObject(element.data(), element.id));
          });
      }) 
  }

  subEventsList() {
      return onSnapshot(this.getEventsRef(), (list) =>{
          this.eventsList = [];
          list.forEach(element => {
              this.eventsList.push(new Events().setEventsObject(element.data(), element.id));
          });
          this.updateEventsByMonth();
      })
  }

  ngOnDestroy(){
      this.unsubUserList();
      this.unsubEventList();
  }

  getUserRef() {
      return collection(this.firestore, 'users');
  } 

  getEventsRef() {
      return collection(this.firestore, 'events');
  }

  updateEventsByMonth() {
      this.eventsByMonth = {};
     
      this.eventsList.forEach(event => {
        const eventDate = new Date(event.day);
        const monthYearKey = `${eventDate.getMonth() + 1}-${eventDate.getFullYear()}`;

        if (this.eventsByMonth[monthYearKey]) {
          this.eventsByMonth[monthYearKey]++;
        } else {
          this.eventsByMonth[monthYearKey] = 1;
        }
      });

   
    console.log('Statistik der Events nach Monat:', this.eventsByMonth);
  }

}


