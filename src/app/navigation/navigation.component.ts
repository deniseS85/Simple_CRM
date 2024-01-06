import { Component, OnInit, ViewChild, inject, HostListener } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { collection, onSnapshot } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Animals } from '../models/animals.class';
import { DataUpdateService } from '../data-update.service';
import { MatDrawer } from '@angular/material/sidenav';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})

export class NavigationComponent implements OnInit {
    firestore: Firestore = inject(Firestore);
    showNavbar: boolean = true;
    currentLink = 'Patient File';
    currentUrl: string = '';
    userList:any = [];
    userName: string = '';
    currentUserId: string = '';
    unsubList;
    animal = new Animals();
    user = new User();
    @ViewChild('drawer') drawer!: MatDrawer;
    isDrawerOpened = true;

    constructor(public router: Router, private authService: AuthService, private dataUpdate: DataUpdateService) {
        this.currentUrl = this.router.url;
        this.unsubList = this.subUsersList();
        this.getSubURL();
    }

    @HostListener('window:resize', ['$event'])
        onResize(event: Event): void {
        this.checkScreenWidth();
    }

    checkScreenWidth(): void {
        let screenWidth = 1369;
        this.isDrawerOpened = window.innerWidth >= screenWidth;
    }

    ngOnDestroy() {
        this.unsubList();
    }

    /**
     * zeigt die Navigation nur an, wenn man eingeloggt ist.
     * UserName wird vom LocalStorage geladen, wenn Seite neugeladen wird
     */
    ngOnInit() {
        this.checkScreenWidth();
        this.getUpdateDate();
        this.userName = localStorage.getItem('userName') || ''; 
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd)
            ).subscribe((event: NavigationEnd) => {
                this.showNavbar = event.url !== '/';
                    if (this.showNavbar) {
                        document.getElementById('drawer')?.classList.remove('d-none');
                        document.getElementById('menu')?.classList.remove('d-none');
                    } else {
                        document.getElementById('drawer')?.classList.add('d-none');
                        document.getElementById('menu')?.classList.add('d-none');
                    }
        });
    }

    toggleDrawer() {
        this.isDrawerOpened = !this.isDrawerOpened;
        if (this.drawer) {
            if (this.isDrawerOpened) {
                this.drawer.open();
            } else {
                this.drawer.close();
            }
        }
    }

    getUpdateDate() {
        this.dataUpdate.userData$.subscribe(userData => {
            this.userName = `${userData.firstName} ${userData.lastName}`;
        });
    }

    /**
     * hebt das Element mit einer Hintergrundfarbe hervor, wenn man darauf klickt
     * @param routerLink 
     * @returns 
     */
    activeLink(routerLink: string) {
        const hasSubURL = routerLink.split('/').length > 1;
    
        if (this.router.isActive(routerLink, true)) {
            this.currentLink = hasSubURL ? 'Patient File' : routerLink.charAt(0).toUpperCase() + routerLink.slice(1);
        }

        return this.router.isActive(routerLink, true) /* || this.router.url.includes(routerLink) */;
    }

    /**
     * ermittelt die Url, wenn die Navigation abgeschlossen ist
     */
    getSubURL() {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.currentUrl = event.url;
                this.getUserFromId();
            } 
        });
    }

    /**
     * onSnapshot: zeigt Änderungen in Echtzeit an (hinzugefügen, aktualisieren oder löschen)
     * list: aktualisierte Liste
     * userList: Liste der User
     * @returns 
     */
    subUsersList() {
        return onSnapshot(this.getUserRef(), (list) =>{
            this.userList = [];
            list.forEach(element => {
                this.userList.push(new User().setUserObject(element.data(), element.id));
            });
        }) 
    }

    getUserRef() {
        return collection(this.firestore, 'users');
    }

    /**
     * durchsucht das Array userList auf die Nutzer mit der aktuellen ID
     * und sucht den dazugehörigen Vor- und Nachnamen
     */
    getUserFromId() {
        const foundUser = this.userList.find((user: any) => this.currentUrl === "/patients/" + user.id);
      
        if (foundUser) {
            this.currentUserId = foundUser.id;
            this.userName = foundUser.firstName + ' ' + foundUser.lastName;
            localStorage.setItem('userName', this.userName);
        } 
    }
    
    getAnimals(): Animals[] {
        return Array.isArray(this.user.animals) ? this.user.animals : [this.user.animals];
    }

    /**
     * Der Nutzer kann sich ausloggen, bei anonymen Nutzer wird dieser in der Firebase gelöscht
     */
    async logout() {
        const user = this.authService.auth.currentUser;

        if (user) {
            if (user.isAnonymous) {
                try {
                    await user.delete();
                } catch (error) {}
            }
            try {
                await this.authService.auth.signOut();
                this.router.navigate(['/']);
            } catch (error) {}
        } else {
            this.router.navigate(['/']);
        }
    }
}

