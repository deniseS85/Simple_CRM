import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore } from '@angular/fire/firestore';
import { Router, NavigationEnd } from '@angular/router';
import { UserTableService } from '../user-table.service';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {
  firestore: Firestore = inject(Firestore);
  user!: User;
  

  showNavbar: boolean = true;
  currentLink = '';
  currentUrl: string = '';
  username: string = '';
  isUser = false;
  isUserSelected = false;
  @ViewChild('inputValue') inputValue!: ElementRef;
   

  constructor(private router: Router, public userTableService: UserTableService) {
    this.currentUrl = this.router.url;
    this.getSubURL();
  }

  ngOnInit() {
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


  activeLink(routerLink: string) {
      if (this.router.isActive(routerLink, true)) {
          this.currentLink = routerLink.charAt(0).toUpperCase() + routerLink.slice(1);
          this.isUser = this.currentLink == 'User' ? true : false;
      }
      return this.router.isActive(routerLink, true);
  }

  getSubURL() {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = event.url;
          this.hasSubPage();
          this.getUserFromId();
        }
      });
  }

  hasSubPage() {
      if (this.currentUrl.split('/').length > 2) {
          this.isUser = false;
          this.isUserSelected = true;
      } else {
          this.isUserSelected = false;
      }
  }

  getUserFromId() {
      for (let i = 0; i < this.userTableService.userList.length; i++) {
          const user = this.userTableService.userList[i];
          if (this.currentUrl == "/user/" + user.id) {
              this.username = user.firstName + ' ' + user.lastName;
          } 
      }
  }



  filterUser() {
      let inputValue = this.inputValue.nativeElement.value.toLowerCase();
      let userTable = this.userTableService.userList;
      let filteredUserList:any[] = [];
    
      if (inputValue.length >= 1) {
          for (let i = 0; i < userTable.length; i++) {
            let firstname = userTable[i].firstName.toLowerCase().substring(0, inputValue.length) == inputValue;
            let lastname = userTable[i].lastName.toLowerCase().substring(0, inputValue.length) == inputValue;
            let city = userTable[i].city.toLowerCase().substring(0, inputValue.length) == inputValue;
      
            if (firstname || lastname || city) {
                filteredUserList.push(userTable[i]);
                
            } else {
             /* kein filteredUserlist = userTable!!!!! */
            }
          }
      } /* else {
       
       
          filteredUserList = userTable;
         
      } */

      this.userTableService.userList = filteredUserList;
      
  }
}

