import { Component, Inject, OnInit, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Animals } from '../models/animals.class';
import { Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { collection, doc } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataUpdateService } from '../data-update.service';

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


    constructor(public dialogRef: MatDialogRef<DialogEditAnimalComponent>,@Inject(MAT_DIALOG_DATA) public data: {animal: Animals}, private dataUpdate: DataUpdateService) {
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
                this.dataUpdate.setAnimalData({ ...this.selectedAnimal });
                await this.updateUserAnimalsInFirestore(isAnimal);
                await this.updateEventsWithName();
                this.loading = false;
                this.dialogRef.close();
            }
        }
    }

    async updateUserAnimalsInFirestore(isAnimal:any) {
        await updateDoc(this.getUserID(), {
            animals: this.user.animals.map(animal =>
                (animal.id === isAnimal.id) ? { ...this.selectedAnimal } : animal.toJsonAnimals()
            )
        });
    }

    async updateEventsWithName() {
        const events = await this.getAllEventsForAnimal(this.selectedAnimal.id);

        await Promise.all(events.map(event =>
            updateDoc(doc(collection(this.firestore, 'events'), event.id), {
                name: this.selectedAnimal.name
            })
        ));
    }

    async getAllEventsForAnimal(animalID: string) {
        let eventsRef = collection(this.firestore, 'events');
        let querySnapshot = await getDocs(query(eventsRef, where('animalID', '==', animalID)));

        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    getUserID() {
        return doc(collection(this.firestore, 'users'), this.user.id);
    }
  
    limitLength(event: any) {
        let maxLength = 15;
        if (event.target.value.length > maxLength) {
            event.target.value = event.target.value.slice(0, maxLength);
        }
    }
}


