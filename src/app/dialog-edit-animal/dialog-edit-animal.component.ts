import { Component, Inject, OnInit, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Animals } from '../models/animals.class';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import { collection, doc } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';



interface Species {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-dialog-edit-animal',
  templateUrl: './dialog-edit-animal.component.html',
  styleUrl: './dialog-edit-animal.component.scss'
})
export class DialogEditAnimalComponent implements OnInit  {
  animals: Species[] = [
    { value: 'Cat', viewValue: 'Cat' },
    { value: 'Dog', viewValue: 'Dog' },
    { value: 'Hamster', viewValue: 'Hamster' },
    { value: 'Rabbit', viewValue: 'Rabbit' },
    { value: 'Guinea pig', viewValue: 'Guinea pig' },
    { value: 'Ferret', viewValue: 'Ferret' },
    { value: 'Rat', viewValue: 'Rat' },
  ];
  genders: string[] = ['Female', 'Male'];
  firestore: Firestore = inject(Firestore);
  user!: User;
  loading =  false;
  animal!: Animals;
  hideRequired = 'true';
  birthDate: any;
  selectedAnimal;
  changeAnimal: Animals[] = []


  constructor(public dialogRef: MatDialogRef<DialogEditAnimalComponent>,@Inject(MAT_DIALOG_DATA) public data: {animal: Animals}) {
      this.selectedAnimal = { ...data.animal };
  }

  ngOnInit(): void {
      this.birthDate = new Date(this.selectedAnimal.birthDate);
  }


  async saveAnimalChange() {
      if (this.selectedAnimal) {
          this.selectedAnimal.birthDate = this.birthDate.getTime();
          this.loading = true;

          const isAnimal = this.user.animals.find(animal => animal.id === this.selectedAnimal.id);

          if (isAnimal) {
            await updateDoc(this.getUserID(), {
                animals: this.user.animals.map(animal =>
                    (animal.id === isAnimal.id) ? { ...this.selectedAnimal } : animal.toJsonAnimals()
                )
            });

              this.loading = false;
              this.dialogRef.close();
          }
      }
}

  getUserID() {
    return doc(collection(this.firestore, 'users'), this.user.id);
}
  
  limitLength(event: any) {
    const maxLength = 15;
      if (event.target.value.length > maxLength) {
          event.target.value = event.target.value.slice(0, maxLength);
      }
    }
}
