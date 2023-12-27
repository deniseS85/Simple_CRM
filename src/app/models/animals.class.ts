export class Animals {
    id: string;
    name: string;
    species: string;
    gender: string;
    birthDate: number;
    microchipID: number;

    constructor(obj?: any) {
        this.id = obj && obj.id ? obj.id : '';
        this.name = obj && obj.name ? obj.name : '';
        this.species = obj && obj.species ? obj.species : '';
        this.gender = obj && obj.gender ? obj.gender : '';
        this.birthDate = obj && obj.birthDate ? obj.birthDate : 0;
        this.microchipID = obj && obj.microchipID ? obj.microchipID : "";
    }

    public toJsonAnimals() {
        return {
            id: this.id,
            name: this.name,
            species: this.species,
            gender: this.gender,
            birthDate: this.birthDate,
            microchipID: this.microchipID
        };
    }

    setAnimalObject(obj:any, id:string) {
        return new Animals({
            id: id || "",
            name: obj?.name || "",
            species: obj?.species || "",
            gender: obj?.gender || "",
            birthDate: obj?.birthDate || 0,
            microchipID: obj?.microchipID || ""
        });
    } 

    generateUniqueId() {
        this.id = new Date().getTime().toString();
    }

}
