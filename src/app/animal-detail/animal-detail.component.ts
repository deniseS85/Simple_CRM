import { Component, inject } from '@angular/core';
import { Firestore, collection, doc, onSnapshot } from '@angular/fire/firestore';
import { Animals } from '../models/animals.class';
import { User } from '../models/user.class';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    selector: 'app-animal-detail',
    templateUrl: './animal-detail.component.html',
    styleUrl: './animal-detail.component.scss'
})
export class AnimalDetailComponent {

    firestore: Firestore = inject(Firestore);
    user = new User();
    userID: any;
    animalNameUrl: any;
    animalList: Animals[] = [];
    unsubAnimalList;
    selectedAnimal:any = '';
    imageSrc: string = '';

    constructor(private route: ActivatedRoute, private router: Router) {
        this.userID = this.route.snapshot.paramMap.get('id');
        this.animalNameUrl = this.route.snapshot.paramMap.get('animal');
        this.unsubAnimalList = this.getAnimalfromUser();
    }

    ngOnDestroy(){
        this.unsubAnimalList();
    }

    getUserID() {
        return doc(collection(this.firestore, 'users'), this.userID);
    }

    getAnimalfromUser() {
        return onSnapshot(this.getUserID(), (element) => {
            this.user = new User(element.data());
            this.animalList = this.user.animals;
            this.getSelectedAnimalFromUser();
        });
    }

    getSelectedAnimalFromUser() {
        for (let i = 0; i < this.animalList.length; i++) {
            let animals = this.animalList[i];

            if (animals.name === this.animalNameUrl) {
                this.selectedAnimal = animals;
                return this.selectedAnimal;
            }
        }
    }

    goBack() {
        const userId = this.route.snapshot.paramMap.get('id');
        this.router.navigate(['/patients', userId]);
    }
    
}
