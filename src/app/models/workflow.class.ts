export class WorkflowItem {
    id: string; 
    img: string;
    name: string;
    lastName: string;
    treatmentName: string;
    hour: string;
    day: string;
    position: string;
  
    constructor(obj?: any) {
      this.id = obj && obj.id ? obj.id : '';
      this.img = obj && obj.img ? obj.img : '';
      this.name = obj && obj.name ? obj.name : '';
      this.lastName = obj && obj.lastName ? obj.lastName : '';
      this.treatmentName = obj && obj.treatmentName ? obj.treatmentName : '';
      this.hour = obj && obj.hour ? obj.hour : '';
      this.day = obj && obj.day ? obj.day : '';
      this.position = obj && obj.position ? obj.position : '';
    }
  
    public toJson() {
      return {
        id: this.id,
        img: this.img,
        name: this.name,
        lastName: this.lastName,
        treatmentName: this.treatmentName,
        hour: this.hour,
        day: this.day,
        position: this.position
      };
    }
  
    setWorkflowItemObject(obj: any, eventId: string) {
      return new WorkflowItem({
        id: eventId,
        img: obj.img || '',
        name: obj.name || '',
        lastName: obj.lastName || '',
        treatmentName: obj.treatmentName || '',
        hour: obj.hour || '',
        day: obj.day || '',
        position: obj.position ? obj.position : ''
      });
    }
}
  