export class Treatment {
    name: string;
    duration: string;
    categoryColor: string;

    constructor(obj?: any) {
        this.name = obj && obj.name ? obj.name : '';
        this.duration = obj && obj.duration ? obj.duration : '';
        this.categoryColor = obj && obj.categoryColor ? obj.categoryColor : '';
    }
}