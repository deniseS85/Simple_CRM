import { Component, Input, OnInit, inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Animals } from '../models/animals.class';
import { DataUpdateService } from '../data-update.service';
import { WorkflowItem } from '../models/workflow.class';
import { elementAt } from 'rxjs';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrl: './workflow.component.scss'
})
export class WorkflowComponent implements OnInit{
  user = new User();
  animal = new Animals();
  firestore: Firestore = inject(Firestore);
  @Input() inputValue!: string;
  todo: WorkflowItem[] = [];
  todoFilter: WorkflowItem[] = [...this.todo];
  waiting: WorkflowItem[] = [];
  waitingFilter: WorkflowItem[] = [...this.waiting];
  treatment: WorkflowItem[] = [];
  treatmentFilter: WorkflowItem[] = [...this.treatment];
  done: WorkflowItem[] = [];
  doneFilter: WorkflowItem[] = [...this.done];
  todayEvents: any[] = [];
  usersList:any = [];
  animalIdsToday:any = [];
  unsubUser;



 /*  todo: { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [
    { img: './assets/img/Cat.png', animalName: 'Lotta', userName: 'Kleister', treatment: 'Impfung', time: '09.00'},
    { img: './assets/img/Dog.png', animalName: 'Buddy', userName: 'John', treatment: 'Checkup', time: '10.30'},
    { img: './assets/img/Rabbit.png', animalName: 'Fluffy', userName: 'Alice', treatment: 'Vaccination', time: '12.15'},
    { img: './assets/img/Hamster.png', animalName: 'Tweety', userName: 'Bob', treatment: 'Feeding', time: '14.45'},
  ];
  
  todoFilter: { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [...this.todo];
  waiting: { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [
    { img: './assets/img/Cat.png', animalName: 'Lucie', userName: 'Michael', treatment: 'Impfung', time: '09.00'},
    { img: './assets/img/Dog.png', animalName: 'Klaus', userName: 'Peter', treatment: 'Checkup', time: '10.30'},
  ];
  waitingFilter: { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [...this.waiting];
  treatment : { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [
    { img: './assets/img/Cat.png', animalName: 'Luna', userName: 'Kleister', treatment: 'Impfung', time: '09.00'},
    { img: './assets/img/Rabbit.png', animalName: 'Ray', userName: 'Sophie', treatment: 'Vaccination', time: '12.15'},
    { img: './assets/img/Hamster.png', animalName: 'Denise', userName: 'Richard', treatment: 'Feeding', time: '14.45'},
  ];
  treatmentFilter: { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [...this.waiting];
  done: { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [
    { img: './assets/img/Cat.png', animalName: 'Lotta', userName: 'Kleister', treatment: 'Impfung', time: '09.00'},
  ];
  doneFilter: { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [...this.done];

 */
  constructor(public dataUpdate: DataUpdateService) {
      this.dataUpdate.getAllEvents();
      this.unsubUser = this.subUsersList();
  }

  ngOnInit(): void {
      this.loadTodayEvents();
  }

  ngOnDestroy() {
      this.unsubUser();
  }

  loadTodayEvents() {
      let today = new Date();
      today.setHours(0, 0, 0, 0);

      this.todayEvents = this.dataUpdate.eventsList.filter((event) => {
          let eventDay: Date | undefined =
              event.day instanceof Date ? event.day : event.day && typeof event.day === 'object' && 'seconds' in event.day ? new Date((event.day as any).seconds * 1000) : undefined;

          if (!eventDay) {
              return false; 
          }
          return eventDay.toDateString() === today.toDateString();
      });
  }

  drop(event: CdkDragDrop<WorkflowItem[]>) {
      if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
          transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              event.previousIndex,
              event.currentIndex,
        );
      }
  }

  filterTasks() {
      this.todoFilter = this.inputValue ? this.todoFilter.filter(item => this.compareInputUser(item)) : [...this.todo];
      this.waitingFilter = this.inputValue ? this.waitingFilter.filter(item => this.compareInputUser(item)) : [...this.waiting];
      this.treatmentFilter = this.inputValue ? this.treatmentFilter.filter(item => this.compareInputUser(item)) : [...this.treatment];
      this.doneFilter = this.inputValue ? this.doneFilter.filter(item => this.compareInputUser(item)) : [...this.done];
  }
 
  compareInputUser(item: WorkflowItem) {
      let inputLower = this.inputValue.toLowerCase();
          return (
              item.name.toLowerCase().startsWith(inputLower) ||
              item.lastName.toLowerCase().startsWith(inputLower)
          );
  }

  sortTasksByTime(tasks: WorkflowItem[]) {
      tasks.sort((a, b) => {
          let [hoursA, minutesA] = a.hour.split(':').map(Number);
          let [hoursB, minutesB] = b.hour.split(':').map(Number);

          if (hoursA !== hoursB) {
              return hoursA - hoursB;
          }
      
          return minutesA - minutesB;
      });
  }

  getUsersRef() {
      return collection(this.firestore, 'users');
  }

  getEventsRef() {
      return collection(this.firestore, 'events');
  }

  subUsersList() {
      return onSnapshot(this.getUsersRef(), (list) =>{
          this.usersList = [];
          list.forEach(element => {
              this.usersList.push(new User().setUserObject(element.data(), element.id));
          });
          this.innerJoin();
          this.sortTasksByTime(this.todo);
          this.sortTasksByTime(this.todoFilter);
      }); 
  }

  innerJoin() {
    this.animalIdsToday = this.todayEvents.map(event => event.animalID);
  
    this.usersList.forEach((user: User) => {
        user.animals.forEach(animal => {
            if (this.animalIdsToday.includes(animal.id)) {
                let matchingEvent = this.todayEvents.find(event => event.animalID === animal.id);
                
                if (matchingEvent) {
                    let imgPath = `./assets/img/${animal.species}.png`;
                    let eventWithLastName = {...matchingEvent, 
                      lastName: user.lastName,
                      img: imgPath 
                    };

                    this.todo.push(eventWithLastName);
                    this.todoFilter.push(eventWithLastName);
                }
            }
        });
    });
  }
}