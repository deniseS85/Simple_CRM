import { Component } from '@angular/core';
import { DateAdapter } from '@angular/material/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {


  constructor(public dateAdapter: DateAdapter<Date>) {
      this.dateAdapter.setLocale('en-GB');
  }
}


