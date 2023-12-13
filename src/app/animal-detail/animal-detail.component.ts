import { Component, inject } from '@angular/core';
import { Firestore, collection, doc, onSnapshot } from '@angular/fire/firestore';
import { Animals } from '../models/animals.class';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-animal-detail',
    templateUrl: './animal-detail.component.html',
    styleUrl: './animal-detail.component.scss'
})
export class AnimalDetailComponent {

    firestore: Firestore = inject(Firestore);
    animal = new Animals();
    animalName: any;
    animalList;

    constructor(private route: ActivatedRoute) {
        this.animalName = this.route.snapshot.paramMap.get('animal');
        this.animalList = this.getAnimalNameFromFirebase();
    }

    ngOnDestroy(){
        this.animalList();
    }

    getAnimalName() {
        return doc(collection(this.firestore, 'users', 'animals', 'name'), this.animalName);
    }

    getAnimalNameFromFirebase() {
        return onSnapshot(this.getAnimalName(), (snapshot) => {
            const animalData = snapshot.data();
            if (animalData && animalData["name"]) {
                this.animalName = animalData["name"];
            }
        });
    }
}
