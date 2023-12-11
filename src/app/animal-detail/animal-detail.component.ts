import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddAnimalComponent } from '../dialog-add-animal/dialog-add-animal.component';


@Component({
  selector: 'app-animal-detail',
  templateUrl: './animal-detail.component.html',
  styleUrl: './animal-detail.component.scss'
})
export class AnimalDetailComponent {

  constructor(public dialog: MatDialog) {}

  addAnimal() {
    const dialog = this.dialog.open(DialogAddAnimalComponent);
  }
}
