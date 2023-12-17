import { Component, Input, inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Animals } from '../models/animals.class';


@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrl: './workflow.component.scss'
})
export class WorkflowComponent {
  user = new User();
  animal = new Animals();
  firestore: Firestore = inject(Firestore);
  @Input() inputValue!: string;
  todo: { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [
    { img: './assets/img/Cat.png', animalName: 'Lotta', userName: 'Kleister', treatment: 'Impfung', time: '09.00'},
  ];
  todoFilter = [];
  waiting: { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [
    { img: './assets/img/Cat.png', animalName: 'Lotta', userName: 'Kleister', treatment: 'Impfung', time: '09.00'},
  ];
  waitingFilter = [];
  treatment : { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [
    { img: './assets/img/Cat.png', animalName: 'Lotta', userName: 'Kleister', treatment: 'Impfung', time: '09.00'},
  ];
  treatmentFilter = [];
  done: { img: string; animalName: string; userName: string; treatment: string; time: string }[] = [
    { img: './assets/img/Cat.png', animalName: 'Lotta', userName: 'Kleister', treatment: 'Impfung', time: '09.00'},
  ];
  doneFilter = [];


  drop(event: CdkDragDrop<{ img: string; animalName: string; userName: string; treatment: string; time: string }[]>) {
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

  

  filterTasks() {}

 
}
