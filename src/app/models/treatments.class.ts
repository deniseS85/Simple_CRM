/* export class Treatments {
    name: string;
    duration: number;
    categoryColor: string;

    constructor(obj?: any) {
        this.name = obj && obj.name ? obj.name : '';
        this.duration = obj && obj.duration ? obj.duration : 0;
        this.categoryColor = obj && obj.categoryColor ? obj.categoryColor : '';
    }

    public toJsonTreatments() {
        return {
            name: this.name,
            duration: this.duration,
            categoryColor: this.categoryColor
        };
    }

    setTreatmentObject(obj:any) {
        return new Treatments({
            name: obj?.name || "",
            duration: obj?.duration || 0,
            categoryColor: obj?.categoryColor || ""
        });
    } 

    public getTreatmentCategoryClass(): string {
        switch (this.categoryColor) {
            case '#c9f7f9':
                return 'medical-check-up';
            case '#fbd1d1':
                return 'dental-care';
            case '#eec3fd':
                return 'vaccination';
            case '#d4f9c6':
                return 'castration';
            case '#f9f6c3':
                return 'laboratory-test';
            case '#DBDBDB':
                return 'operation';
            default:
                return '';
        }
    }

    static treatmentsList: Treatments[] = [
        new Treatments({ name: 'Medical Check-Up ', categoryColor: '#c9f7f9', duration: 2 }),
        new Treatments({ name: 'Dental Care', categoryColor: '#fbd1d1', duration: 1 }),
        new Treatments({ name: 'Vaccination', categoryColor: '#eec3fd', duration: 1 }),
        new Treatments({ name: 'Castration', categoryColor: '#d4f9c6', duration: 2 }),
        new Treatments({ name: 'Laboratory Test', categoryColor: '#f9f6c3', duration: 1 }),
        new Treatments({ name: 'Operation', categoryColor: '#DBDBDB', duration: 3 }),
      ];

} */