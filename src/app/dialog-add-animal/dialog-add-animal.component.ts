import { Component } from '@angular/core';

interface Animal {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-dialog-add-animal',
  templateUrl: './dialog-add-animal.component.html',
  styleUrl: './dialog-add-animal.component.scss'
})
export class DialogAddAnimalComponent {
  animals: Animal[]  = [
    {value: 'cat-0', viewValue: 'Cat'},
    {value: 'dog-1', viewValue: 'Dog'},
    {value: 'hamster-2', viewValue: 'Hamster'},
    {value: 'rabbit-3', viewValue: 'Rabbit'},
    {value: 'guineapig-4', viewValue: 'Guinea pig'},
    {value: 'ferret-5', viewValue: 'Ferret'},
    {value: 'mouserat-6', viewValue: 'Mouse/Rat'},
   
  ];


  loading = false;
  hideRequired ="true";
  labelPosition: 'before' | 'after' = 'after';
  

  saveAnimal() {}
}
