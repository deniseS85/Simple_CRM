import { Component, Input, OnInit, inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Firestore, addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Animals } from '../models/animals.class';
import { DataUpdateService } from '../data-update.service';
import { WorkflowItem } from '../models/workflow.class';
import { Subject } from 'rxjs';


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
      this.unsubUser = this.subUsersList();
      this.dataUpdate.getAllEvents();
  }

    ngOnInit(): void {
        this.initializeWorkflow();
    }

    ngOnDestroy() {
        this.unsubUser();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    initializeWorkflow():void {
        this.loadTodayEvents().then(() => {
            this.innerJoin();
            this.setNextDayStartInterval();
            this.deleteOldWorkflowItems();
        });
    }

    async addWorkflowItemsToDatabase() {
        for (let event of this.todayEvents) {
          await this.addWorkflowItemDatabase(event, event.id);
        }
    }

    async loadTodayEvents(): Promise<void> {
        return new Promise<void>((resolve) => {
            let today = new Date();
            today.setHours(0, 0, 0, 0);
    
            let eventsRef = collection(this.firestore, 'events');
            let queryToday = query(eventsRef, where('day', '>=', today), where('day', '<', new Date(today.getTime() + 24 * 60 * 60 * 1000)));
    
            onSnapshot(queryToday, (querySnapshot) => {
                this.todayEvents = [];
                querySnapshot.forEach((doc) => {
                    let event = doc.data() as Event; 
                    this.todayEvents.push(event);
                });
                resolve();
            })
        })
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

    async addWorkflowItemDatabase(item: WorkflowItem, eventId: string): Promise<void> {
        
        try {
            let collectionRef = collection(this.firestore, 'workflow');
            let collectionQuery = query(collectionRef, where('id', '==', item.id));
            let querySnapshot = await getDocs(collectionQuery);
           
                if (querySnapshot.size === 0) {
                    let newItem = new WorkflowItem().setWorkflowItemObject(item, eventId);
                    await addDoc(collectionRef, newItem.toJson());
                }
        } catch (error) {
            console.error('Error saving workflow item: ', error);
        }
    }


    async isNotTodayThenRemove(): Promise<void> {
        let querySnapshot = await getDocs(this.getWorkflowRef());
        let today = new Date();
        today.setHours(0, 0, 0, 0);
    
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
    
            if (itemDay.toDateString() !== today.toDateString()) {
            
            await deleteDoc(doc(this.getWorkflowRef(), docSnapshot.id));
            }
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
        });
    }

    innerJoin() { 
        this.animalIdsToday = this.todayEvents.map(event => event.animalID);

        this.usersList.forEach((user: User) => {
            user.animals.forEach(animal => {
                if (this.animalIdsToday.includes(animal.id)) {
                    let matchingEvent = this.todayEvents.find(event => event.animalID === animal.id);

                    if (matchingEvent) {
                        let eventWithLastNameImg = {...matchingEvent, 
                            lastName: user.lastName,
                            img: `./assets/img/${animal.species}.png`
                        };
                        
                        this.todo.push(eventWithLastNameImg);
                        this.todoFilter.push(eventWithLastNameImg);
                        this.addWorkflowItemDatabase(eventWithLastNameImg, eventWithLastNameImg.id);
                        this.sortTasksByTime(this.todo);
                        this.sortTasksByTime(this.todoFilter);  
                        
                    }
                }
            })
        })
    } 
    


    async deleteOldWorkflowItems(): Promise<void> {
        let querySnapshot = await getDocs(this.getWorkflowRef());
        let today = new Date();
        today.setHours(0, 0, 0, 0);
    
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
    
            if (itemDay.toDateString() !== today.toDateString()) {
                await deleteDoc(doc(this.getWorkflowRef(), docSnapshot.id));
            }
        }
    }

}