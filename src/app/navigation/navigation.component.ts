import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserTableService } from '../user-table.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {

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

