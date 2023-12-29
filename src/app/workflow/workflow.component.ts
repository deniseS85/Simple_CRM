import { Component, Input, OnInit, inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Firestore, addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Animals } from '../models/animals.class';
import { DataUpdateService } from '../data-update.service';
import { WorkflowItem } from '../models/workflow.class';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrl: './workflow.component.scss'
})
export class WorkflowComponent implements OnInit{
  user = new User();
  animal = new Animals();
  workflow: WorkflowItem[] = [];
  firestore: Firestore = inject(Firestore);
  @Input() inputValue!: string;
  todo: WorkflowItem[] = [];
  todoFilter: WorkflowItem[] = [...this.todo];
  waiting: WorkflowItem[] = [];
  waitingFilter: WorkflowItem[] = [...this.waiting];
  treatment: WorkflowItem[] = [];
  treatmentFilter: WorkflowItem[] = [...this.treatment];
  done: WorkflowItem[] = [];
  doneFilter: WorkflowItem[] = [...this.done];
  todayEvents: any[] = [];
  usersList:any = [];
  animalIdsToday:any = [];
  unsubUser;
  private unsubscribe$: Subject<void> = new Subject<void>();


  constructor(public dataUpdate: DataUpdateService) {
      this.dataUpdate.getAllEvents();
      this.unsubUser = this.subUsersList();
  }

    ngOnInit(): void {
        this.loadTodayEvents().then(() => {
            for (let event of this.todayEvents) {
            this.addWorkflowItemDatabase(event);
            }

            this.setNextDayStartInterval();
        });
    }

    ngOnDestroy() {
        this.unsubUser();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    async loadTodayEvents(): Promise<void> {
        return new Promise<void>((resolve) => {
            let today = new Date();
            today.setHours(0, 0, 0, 0);
    
            this.dataUpdate.eventsList$.pipe(takeUntil(this.unsubscribe$)).subscribe((eventsList) => {
                this.todayEvents = eventsList.filter((event) => {
                    let eventDay: Date | undefined =
                        event.day instanceof Date ? event.day : event.day && typeof event.day === 'object' && 'seconds' in event.day ? new Date((event.day as any).seconds * 1000) : undefined;

                    if (!eventDay) {
                        return false;
                    }
                    return eventDay.toDateString() === today.toDateString();
                });
                
                resolve();
            });
        });
    }

    drop(event: CdkDragDrop<WorkflowItem[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            this.updatePositionsInDatabase(event.container.data);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
            this.updatePositionsInDatabase(event.container.data);
        }
    }

    async addWorkflowItemDatabase(item: WorkflowItem): Promise<void> {
        let workflowCollection = collection(this.firestore, 'workflow');
        
        try {
            let collectionRef = collection(this.firestore, 'workflow');
            let collectionQuery = query(collectionRef, where('id', '==', item.id));
            let querySnapshot = await getDocs(collectionQuery);
           

                if (querySnapshot.size === 0) {
                    let newItem = new WorkflowItem().setWorkflowItemObject(item);
                    await addDoc(workflowCollection, newItem.toJson());
                }
        } catch (error) {
            console.error('Error saving workflow item: ', error);
        }
    }

    async isNotTodayThenRemove(): Promise<void> {
        try {
            let querySnapshot = await getDocs(this.getWorkflowRef());
            let today = new Date();
            today.setHours(0, 0, 0, 0);
    
            let newData: WorkflowItem[] = [];
            for (let docSnapshot of querySnapshot.docs) {
                let item = docSnapshot.data() as WorkflowItem;
                let itemDay: Date;
    
                if (typeof item.day === 'string') {
                    itemDay = new Date(item.day);
                } else if (typeof item.day === 'object' && 'seconds' in item.day) {
                    itemDay = new Date((item.day as any).seconds * 1000);
                } else {
                    continue; 
                }
    
                if (itemDay.toDateString() === today.toDateString()) {
                    newData.push(item);
                }
            }
            await this.replaceOldEvents(newData);
        } catch (error) {
            console.error('Error when checking and removing outdated workflow elements: ', error);
        }
    }

    async replaceOldEvents(newData: WorkflowItem[]): Promise<void> {
        let workflowCollection = collection(this.firestore, 'workflow');
    
        try {
            let querySnapshot = await getDocs(workflowCollection);
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
    
            for (let item of newData) {
                let newItem = new WorkflowItem(item);
                await addDoc(workflowCollection, newItem.toJson());
            }
        } catch (error) {
            console.error('Error replacing the workflow collection: ', error);
        }
    }

    setNextDayStartInterval() {
        let now = new Date();
        let tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
    
        let timeUntilNextDayStart = tomorrow.getTime() - now.getTime();
    
        setInterval(() => {
            this.isNotTodayThenRemove();
            this.setNextDayStartInterval();
        }, timeUntilNextDayStart);
    }

    getWorkflowRef() {
        return collection(this.firestore, 'workflow');
    }

    updatePositionsInDatabase(items: WorkflowItem[]) {
        items.forEach((item, index) => {
            item.position = index;
            this.updateWorkflowItem(item);
        });
    }

    updateWorkflowItem(workflowItem: WorkflowItem) {
        let workflowDoc = doc(this.firestore, 'workflow', workflowItem.id);
        return updateDoc(workflowDoc, { position: workflowItem.position });
    }

    filterTasks() {
        this.todoFilter = this.inputValue ? this.todoFilter.filter(item => this.compareInputUser(item)) : [...this.todo];
        this.waitingFilter = this.inputValue ? this.waitingFilter.filter(item => this.compareInputUser(item)) : [...this.waiting];
        this.treatmentFilter = this.inputValue ? this.treatmentFilter.filter(item => this.compareInputUser(item)) : [...this.treatment];
        this.doneFilter = this.inputValue ? this.doneFilter.filter(item => this.compareInputUser(item)) : [...this.done];
    }
    
    compareInputUser(item: WorkflowItem) {
        let inputLower = this.inputValue.toLowerCase();
            return (
                item.name.toLowerCase().startsWith(inputLower) ||
                item.lastName.toLowerCase().startsWith(inputLower)
            );
    }

    sortTasksByTime(tasks: WorkflowItem[]) {
        tasks.sort((a, b) => {
            let [hoursA, minutesA] = a.hour.split(':').map(Number);
            let [hoursB, minutesB] = b.hour.split(':').map(Number);

            if (hoursA !== hoursB) {
                return hoursA - hoursB;
            }
        
            return minutesA - minutesB;
        });
    }

    getUsersRef() {
        return collection(this.firestore, 'users');
    }

    getEventsRef() {
        return collection(this.firestore, 'events');
    }

    subUsersList() {
        return onSnapshot(this.getUsersRef(), (list) =>{
            this.usersList = [];
            list.forEach(element => {
                this.usersList.push(new User().setUserObject(element.data(), element.id));
            });
            this.innerJoin();
            this.sortTasksByTime(this.todo);
            this.sortTasksByTime(this.todoFilter);
        });
    }

    innerJoin() {
        this.animalIdsToday = this.todayEvents.map(event => event.animalID);
        this.workflow = [];
    
        this.usersList.forEach((user: User) => {
            user.animals.forEach(animal => {
                if (this.animalIdsToday.includes(animal.id)) {
                    let matchingEvent = this.todayEvents.find(event => event.animalID === animal.id);
                    
                    if (matchingEvent) {
                        let imgPath = `./assets/img/${animal.species}.png`;
                        let eventWithLastNameImg = {...matchingEvent, 
                        lastName: user.lastName,
                        img: imgPath 
                        };

                        this.workflow.push(eventWithLastNameImg);
                        this.todo.push(eventWithLastNameImg);
                        this.todoFilter.push(eventWithLastNameImg);
                    }
                }
            });
        });
    }
}