import { Component, Input, OnInit, inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Animals } from '../models/animals.class';
import { DataUpdateService } from '../data-update.service';
import { WorkflowItem } from '../models/workflow.class';

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
  animals:any = [];


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
      

  }

  ngOnInit(): void {
      this.loadTodayEvents();
  }

  loadTodayEvents() {
      let today = new Date();
      today.setHours(0, 0, 0, 0);


      this.todayEvents = this.dataUpdate.eventsList.filter((event) => {
          const eventDay: Date | undefined =
              event.day instanceof Date ? event.day : event.day && typeof event.day === 'object' && 'seconds' in event.day ? new Date((event.day as any).seconds * 1000) : undefined;

          if (!eventDay) {
              return false; 
          }

          return eventDay.toDateString() === today.toDateString();
      });

      this.todo = [...this.todayEvents];
      this.todoFilter = [...this.todayEvents];
      this.sortTasksByTime(this.todo);
      this.sortTasksByTime(this.todoFilter);
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
          item.name.toLowerCase().includes(inputLower) ||
          item.lastName.toLowerCase().includes(inputLower)
        );
  }

  sortTasksByTime(tasks: WorkflowItem[]) {
      tasks.sort((a, b) => {
          const [hoursA, minutesA] = a.hour.split(':').map(Number);
          const [hoursB, minutesB] = b.hour.split(':').map(Number);
      
          if (hoursA !== hoursB) {
              return hoursA - hoursB;
          }
      
          return minutesA - minutesB;
      });
  }

  

  


}