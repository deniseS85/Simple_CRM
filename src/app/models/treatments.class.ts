export class Treatment {
    animalID: string;
    name: string;
    duration: string;
    categoryColor: string;

    constructor(obj?: any) {
        this.animalID = obj && obj.animalID ? obj.animalID : '';
        this.name = obj && obj.name ? obj.name : '';
        this.duration = obj && obj.duration ? obj.duration : '';
        this.categoryColor = obj && obj.categoryColor ? obj.categoryColor : '';
    }
}