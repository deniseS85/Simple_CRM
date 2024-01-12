export interface TreatmentsSelection {
  name: string;
  categoryColor: string;
  duration: number;
  
};

export class Events {
  animalID: string;
  day: Date;
  hour: string;
  id: string;
  name: string;
  treatmentName: string;
  duration: number;
  categoryColor: string;

 
  static treatments: TreatmentsSelection[] = [ 
    { name: 'Medical Check-Up', categoryColor: '#c9f7f9', duration: 2 },
    { name: 'Dental Care', categoryColor: '#fbd1d1', duration: 1 },
    { name: 'Vaccination', categoryColor: '#eec3fd', duration: 1 },
    { name: 'Castration', categoryColor: '#d4f9c6', duration: 2 },
    { name: 'Laboratory Test', categoryColor: '#f9f6c3', duration: 1 },
    { name: 'Operation', categoryColor: '#DBDBDB', duration: 3 },
  ];

  constructor(obj?: any) {
    this.animalID = obj && obj.animalID ? obj.animalID : '';
    this.day = obj && obj.day ? obj.day : '';
    this.hour = obj && obj.hour ? obj.hour : '';
    this.id = obj && obj.id ? obj.id : '';
    this.name = obj && obj.name ? obj.name : '';
    this.treatmentName = obj && obj.treatmentName ? obj.treatmentName : '';
    this.duration = obj && obj.duration ? obj.duration : 0;
    this.categoryColor = obj && obj.categoryColor ? obj.categoryColor : '';
  }

  public toEventJson() {
    return {
      animalID: this.animalID,
      day: this.day,
      hour: this.hour,
      id: this.id,
      name: this.name,
      treatmentName: this.treatmentName,
      duration: this.duration,
      categoryColor: this.categoryColor,
    };
  }

  setEventsObject(obj: any, id: string) {
    return new Events({
      animalID: obj.animalID || "",
      day: obj.day ? new Date(obj.day.seconds * 1000) : null,
      hour: obj.hour || "",
      id: id || "",
      name: obj.name || '',
      treatmentName: obj.treatmentName || '',
      duration: obj.duration || 0,
      categoryColor: obj.categoryColor || '',
    });
  } 
}
