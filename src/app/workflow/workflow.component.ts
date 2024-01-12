import { Component, Input, OnInit, inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DocumentData, Firestore, QuerySnapshot, addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
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
  isMobile: boolean = false;
  popupOpen: boolean = false;
  selectedItem: any;
  popupOpenMap: { [itemId: string]: boolean } = {};
  private unsubscribe$: Subject<void> = new Subject<void>();

  
    constructor(public dataUpdate: DataUpdateService) {
        this.unsubUser = this.subUsersList();
        this.dataUpdate.getAllEvents();
        window.addEventListener('resize', () => {
                this.checkScreenWidth();
        });
        this.checkScreenWidth();
    }

    ngOnInit(): void {
        this.loadTodayEvents().then(() => {
            this.dataUpdate.getAllEvents();
            this.initializeWorkflow();
        });
    }

    checkScreenWidth() {
        this.isMobile = window.innerWidth <= 700;
    }

    openPopup(item: any) {
        this.selectedItem = item;

        if (this.popupOpenMap[item.id]) {
            this.popupOpenMap[item.id] = false;
        } else {
            this.closeAllPopups();
            this.popupOpenMap[item.id] = true;
        }
      }
    
    closeAllPopups() {
        for (let itemId in this.popupOpenMap) {
            if (this.popupOpenMap.hasOwnProperty(itemId)) {
                this.popupOpenMap[itemId] = false;
            }
        }
    }

    moveTo(status: string) {
        this.popupOpen = false;
        this.selectedItem.status = status;
        this.selectedItem.position = status;
        this.popupOpenMap[this.selectedItem.id] = false;
        this.updateWorkflowItemPositions(this.selectedItem);
    }

    ngOnDestroy() {
        this.unsubUser();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    initializeWorkflow(): void {
        this.deleteOldWorkflowItems();
        this.loadWorkflowItems();
        this.innerJoin();
        this.setNextDayStartInterval();
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
    
            let queryToday = query(this.getEventsRef(), where('day', '>=', today), where('day', '<', new Date(today.getTime() + 24 * 60 * 60 * 1000)));
    
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

    drop(event: CdkDragDrop<WorkflowItem[]>, targetColumn: string): void {
        if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
          );  
          event.container.data[event.currentIndex].position = targetColumn;
          this.updateWorkflowItemPositions(event.container.data[event.currentIndex]);
        }  
    }

    async updateWorkflowItemPositions(item: WorkflowItem): Promise<void> {
        let workflowID = doc(collection(this.firestore, 'workflow'), item.id);
    
        try {
            await updateDoc(workflowID, { position: item.position });
        } catch (error) {
            console.error('Error updating workflow item:', error);
        }
        await this.loadWorkflowItems();
    }

    async loadWorkflowItems(): Promise<void> {
        let querySnapshot = await getDocs(this.getWorkflowRef());
        let  workflowItems: WorkflowItem[] = this.mapQuerySnapshotToWorkflowItems(querySnapshot);
        this.workflow = workflowItems;
        this.sortTasksByTime(this.workflow); 
        this.updateFilterArrays();
    }

    private mapQuerySnapshotToWorkflowItems(querySnapshot: QuerySnapshot<DocumentData>): WorkflowItem[] {
        const workflowItems: WorkflowItem[] = [];
    
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const workflowItem = this.createWorkflowItemFromData(doc.id, data);
            workflowItems.push(workflowItem);
        });
    
        return workflowItems;
    }
    
    private createWorkflowItemFromData(id: string, data: DocumentData): WorkflowItem {
        return new WorkflowItem({
            id: id,
            img: data['img'],
            name: data['name'],
            lastName: data['lastName'],
            treatmentName: data['treatmentName'],
            hour: data['hour'],
            day: data['day'],
            position: data['position'],
        });
    }

    updateFilterArrays(): void {
        this.todoFilter = this.workflow.filter(item => item.position === 'todo');
        this.waitingFilter = this.workflow.filter(item => item.position === 'waiting');
        this.treatmentFilter = this.workflow.filter(item => item.position === 'treatment');
        this.doneFilter = this.workflow.filter(item => item.position === 'done');
    }
  
    onDragStarted(item: WorkflowItem, position: string): void {
        item.position = position;  
    }

    async addWorkflowItemDatabase(item: WorkflowItem, eventId: string): Promise<void> {
        try {
            let collectionQuery = query(this.getWorkflowRef(), where('id', '==', item.id));
            let querySnapshot = await getDocs(collectionQuery);
           
                if (querySnapshot.size === 0) {
                    let newItem = new WorkflowItem().setWorkflowItemObject(item, eventId);
                    await addDoc(this.getWorkflowRef(), newItem.toJson());
                    this.workflow.push(newItem);
                    this.sortTasksByTime(this.workflow);
                    this.updateFilterArrays();
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
    
    filterTasks() {
        if (this.inputValue) {
            let filterByPosition = (position: string) => {
                return this.workflow.filter(item => item.position === position && this.compareInputUser(item));
            };
            this.todoFilter = filterByPosition('todo');
            this.waitingFilter = filterByPosition('waiting');
            this.treatmentFilter = filterByPosition('treatment');
            this.doneFilter = filterByPosition('done');
        } else {
            this.updateFilterArrays();
        }
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
        this.usersList.forEach((user: User) => {
            user.animals.forEach(animal => {
                this.filterTodayEventsForAnimal(user, animal);
            });
        });
    }
    
    private filterTodayEventsForAnimal(user: User, animal: Animals) {
        const animalEvents = this.todayEvents.filter(todayEvent => todayEvent.animalID === animal.id);
    
        animalEvents.forEach(todayEvent => {
            this.processAnimalEvent(user, animal, todayEvent);
        });
    }
    
    private processAnimalEvent(user: User, animal: Animals, todayEvent: WorkflowItem) {
        const eventWithLastNameImg = this.createWorkflowItemFromEvent(user, animal, todayEvent);
    
        this.addToTodoLists(eventWithLastNameImg);
        this.addToDatabaseAndSort(eventWithLastNameImg);
    }
    
    private createWorkflowItemFromEvent(user: User, animal: Animals, todayEvent: WorkflowItem): WorkflowItem {
        return new WorkflowItem({
            id: todayEvent.id,
            name: todayEvent.name,
            lastName: user.lastName,
            img: `./assets/img/${animal.species}.png`,
            treatmentName: todayEvent.treatmentName,
            hour: todayEvent.hour,
            day: todayEvent.day,
            position: todayEvent.position
        });
    }
    
    private addToTodoLists(eventWithLastNameImg: WorkflowItem) {
        this.todo.push(eventWithLastNameImg);
        this.todoFilter.push(eventWithLastNameImg);
    }
    
    private addToDatabaseAndSort(eventWithLastNameImg: WorkflowItem) {
        this.addWorkflowItemDatabase(eventWithLastNameImg, eventWithLastNameImg.id);
        this.sortTasksByTime(this.todo);
        this.sortTasksByTime(this.todoFilter);
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