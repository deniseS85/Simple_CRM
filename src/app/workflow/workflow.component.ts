import { Component, inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList} from '@angular/cdk/drag-drop';
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

  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];
  waiting = ['spielen', 'steichen', 'fahren'];
  treatment = ['schlafen', 'putzen'];
  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

  drop(event: CdkDragDrop<string[]>) {
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

 
}
