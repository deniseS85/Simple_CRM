import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-event',
  templateUrl: './dialog-add-event.component.html',
  styleUrl: './dialog-add-event.component.scss'
})
export class DialogAddEventComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  eventData: string = '';

  saveEvent(): void {
    // Hier kannst du Logik hinzufügen, um das Event zu speichern
    console.log('Gespeichertes Event:', this.eventData);
  }
}