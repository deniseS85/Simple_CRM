import { Animals } from "./animals.class";

export class User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: number;
    street: string;
    postCode: number;
    city: string;
    animals: Animals[] = [];

    constructor(obj?: any) {
        this.id = obj && obj.id ? obj.id : '';
        this.firstName = obj && obj.firstName ? obj.firstName : '';
        this.lastName = obj && obj.lastName ? obj.lastName : '';
        this.email = obj && obj.email ? obj.email : '';
        this.birthDate = obj && obj.birthDate ? obj.birthDate : 0;
        this.street = obj && obj.street ? obj.street : '';
        this.postCode = obj && obj.postCode ? obj.postCode : '';
        this.city = obj && obj.city ? obj.city : '';
        this.animals = obj && obj.animals && Array.isArray(obj.animals) ? obj.animals.map((animal: any) => new Animals(animal)) : [];    
    }

    public toJson() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            birthDate: this.birthDate,
            street: this.street,
            postCode: this.postCode,
            city: this.city,
            animals: this.animals.map(animal => animal.toJsonAnimals())
        };
    }

    setUserObject(obj:any, id:string) {
        return new User({
            id: id || "",
            firstName: obj.firstName || "",
            lastName: obj.lastName || "",
            email: obj.email || "",
            birthDate: obj.birthDate || 0,
            street: obj.street || "",
            postCode: obj.postCode || "",
            city: obj.city || "",
            animals: obj.animals && Array.isArray(obj.animals) ? obj.animals.map((animal: any) => new Animals(animal)) : []
        });
    } 
}