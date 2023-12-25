export class Events {
  animalID: string;
  day: Date;
  hour: string;
  id: string;
  name: string;
  treatmentName: string;
  duration: number;
  categoryColor: string;


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
