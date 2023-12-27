export class WorkflowItem {
    img: string; //species abhängig
    name: string;
    lastName: string; //id animal mit id animal from user
    treatmentName: string;
    hour: string;
    day: string;
  
    constructor(obj?: any) {
      this.img = obj && obj.img ? obj.img : '';
      this.name = obj && obj.name ? obj.name : '';
      this.lastName = obj && obj.lastName ? obj.lastName : '';
      this.treatmentName = obj && obj.treatmentName ? obj.treatmentName : '';
      this.hour = obj && obj.hour ? obj.hour : '';
      this.day = obj && obj.day ? obj.day : '';
    }
  
    public toJson() {
      return {
        img: this.img,
        name: this.name,
        lastName: this.lastName,
        treatmentName: this.treatmentName,
        hour: this.hour,
        day: this.day,
      };
    }
  
    setWorkflowItemObject(obj: any) {
      return new WorkflowItem({
        img: obj.img || '',
        name: obj.name || '',
        lastName: obj.lastName || '',
        treatmentName: obj.treatmentName || '',
        hour: obj.hour || '',
        day: obj.day || '',
      });
    }
  }
  