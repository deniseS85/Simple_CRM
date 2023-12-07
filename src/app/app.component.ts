import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserTableService } from './user-table.service';
import { user } from '@angular/fire/auth';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'simple-crm';
  currentLink = '';
  isUser = false;
  @ViewChild('inputValue') inputValue!: ElementRef;

  constructor(private router: Router, public userTableService: UserTableService) {}

  activeLink(routerLink: string) {
      if (this.router.isActive(routerLink, true)) {
          this.currentLink = routerLink.charAt(0).toUpperCase() + routerLink.slice(1);
          this.isUser = this.currentLink == 'User' ? true : false;
      }
      
      return this.router.isActive(routerLink, true);
  }

  filterUser() {
      let inputValue = this.inputValue.nativeElement.value.toLowerCase();
      let userTable = this.userTableService.userList;


      if (inputValue) {
          for (let i = 0; i < userTable.length; i++) {
              let firstname = userTable[i].firstName.toLowerCase().substring(0, inputValue.length) == inputValue;
              let lastname = userTable[i].lastName.toLowerCase().substring(0, inputValue.length) == inputValue;
              let city = userTable[i].city.toLowerCase().substring(0, inputValue.length) == inputValue;

              if (firstname || lastname || city) {
                console.log(userTable[i]);
              } 
          }
      } else {
          this.userTableService.userList = userTable;
          console.log(userTable);
      }
    }
}


