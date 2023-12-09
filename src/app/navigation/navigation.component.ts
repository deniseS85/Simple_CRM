import { Component, OnInit, inject } from '@angular/core';
import { collection, doc, onSnapshot } from '@angular/fire/firestore';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Auth, signOut } from '@angular/fire/auth';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {
  firestore: Firestore = inject(Firestore);
  user = new User();
  showNavbar: boolean = true;
  currentLink = '';
  currentUrl: string = '';
  isUser = false;
  isUserSelected = false;

 
  
   
  constructor(private router: Router, private auth: Auth) {
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

  logout() {
      signOut(this.auth);
        this.router.navigate(['/']);
  } 

}

