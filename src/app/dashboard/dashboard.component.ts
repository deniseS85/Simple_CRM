import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { Events } from '../models/events.class';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements AfterViewInit {
  firestore: Firestore = inject(Firestore);
  userList:any = [];
  unsubUserList;
  unsubEventList;
  eventsList:any[] = [];
  eventsByMonth: Record<string, number> = {};
  @ViewChild('barCanvas') barCanvas!: ElementRef;
  barChart: any;
  eventYear: number = new Date().getFullYear();
  allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  currentMonth: Date = new Date();
  weekDays: string[] = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  weeks: Date[][] = [];
  datePipe: DatePipe = new DatePipe('en-US');
  formattedMonth: string | null = null;


  constructor(private router: Router) {
      this.unsubUserList = this.subUsersList();
      this.unsubEventList = this.subEventsList();
      this.generateCalendar();
  }

  
  ngAfterViewInit() {
      this.createBarChart();
  }

  subUsersList() {
      return onSnapshot(this.getUserRef(), (list) =>{
          this.userList = [];
          list.forEach(element => {
              this.userList.push(new User().setUserObject(element.data(), element.id));
          });
      }) 
  }

  subEventsList() {
      return onSnapshot(this.getEventsRef(), (list) =>{
          this.eventsList = [];
          list.forEach(element => {
              this.eventsList.push(new Events().setEventsObject(element.data(), element.id));
          });
          this.updateEventsByMonth();
          this.updateBarChart(); 
      })
  }

  ngOnDestroy(){
      this.unsubUserList();
      this.unsubEventList();
  }

  getUserRef() {
      return collection(this.firestore, 'users');
  } 

  getEventsRef() {
      return collection(this.firestore, 'events');
  }

  updateEventsByMonth() {
      let currentMonth = new Date().getMonth();
    
      this.eventsByMonth = Object.fromEntries(this.allMonths.map(month => [`${month}-${this.eventYear}`, 0]));
    
      this.eventsList.forEach(event => {
          let eventDate = new Date(event.day);
          let eventMonth = eventDate.getMonth();
          let eventYear = eventDate.getFullYear();
      
          if (eventYear === this.eventYear && eventMonth <= currentMonth) {
              let month = this.allMonths[eventMonth];
              this.eventsByMonth[`${month}-${this.eventYear}`]++;
          }
      });
  }
  

  createBarChart() {
      let ctx = this.barCanvas.nativeElement.getContext('2d');
  
      this.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.allMonths,
          datasets: [{
            data:  Object.values(this.eventsByMonth),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            barThickness: 20,
          }],
        },
        options: {
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true,
                  ticks: {
                    color: 'lightgrey',
                    stepSize: 2
                  },
                  min: 0,
                  max: 8,
                  grid: {
                    color: 'rgb(1,103,175)'
                  },
              },
              x: {
                  ticks: {
                    color: 'lightgrey',
                    maxRotation: 0,
                    minRotation: 0
                  }
              }
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `Events: ${context.parsed.y}`;
                },
              },
            },
          }, 
        }
      });
  }

  updateBarChart() {
      if (this.barChart) {
          this.barChart.data.labels = Object.keys(this.eventsByMonth).map(label => {
              let [month, year] = label.split('-');
              return month;
          });

          this.barChart.data.datasets[0].data = Object.values(this.eventsByMonth);
          this.barChart.update();
      }
  }

  previousYear() {
      this.eventYear--;
      this.updateEventsByMonth();
      this.updateBarChart();
  }

  nextYear() {
      this.eventYear++;
      this.updateEventsByMonth();
      this.updateBarChart();  
  }

  generateCalendar() {
      let firstDayOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
      let lastDayOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    
      firstDayOfMonth.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay() + (firstDayOfMonth.getDay() === 0 ? -6 : 1));
    
      let currentDay = new Date(firstDayOfMonth);
      this.weeks = [];
    
      while (currentDay <= lastDayOfMonth) {
          let week: Date[] = [];
      
          for (let i = 0; i < 7; i++) {
              if (currentDay >= firstDayOfMonth && currentDay <= lastDayOfMonth) {
                  week.push(new Date(currentDay));
              } 
              currentDay.setDate(currentDay.getDate() + 1);
          }
          this.weeks.push(week);
      }
      this.setFormattedMonth();
  }

  setFormattedMonth() {
      const datePipe: DatePipe = new DatePipe('en-US');
      this.formattedMonth = datePipe.transform(this.currentMonth, 'MMMM yyyy');
  }
  

  isToday(date: Date | null): boolean {
    if (date) {
      let today = new Date();
      if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        // Hervorhebung für den heutigen Tag
        return true;
      }
      if (date.getDay() === 6 && date.getDate() === today.getDate()) {
        // Samstag und heute
        return true;
      }
      if (date.getDay() === 0 && date.getDate() === today.getDate()) {
        // Sonntag und heute
        return true;
      }
    }
    return false; 
  }
  

  previousMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  navigateToDay(day: Date) {
      let formattedDate = this.datePipe.transform(day, 'yyyy-MM-dd');
      this.router.navigate(['/calendar'], { queryParams: { selectedDate: formattedDate } });
  }
}





