import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { Events } from '../models/events.class';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


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
  @ViewChild('barCanvas') private barCanvas!: ElementRef;
  private barChart: any;
  eventYear:any;

  constructor() {
      this.unsubUserList = this.subUsersList();
      this.unsubEventList = this.subEventsList();
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
      let allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let currentDate = new Date();
      let currentMonth = currentDate.getMonth();
      let currentYear = currentDate.getFullYear();
      let relevantMonths = [];

      for (let i = 11; i >= 0; i--) {
          let monthIndex = (currentMonth - i + 12) % 12;
          relevantMonths.push(allMonths[monthIndex]);
      }
    
      this.eventsByMonth = Object.fromEntries(relevantMonths.map(month => [`${month}-${currentYear}`, 0]));

      this.eventsList.forEach(event => {
          let eventDate = new Date(event.day);
          let eventMonth = eventDate.getMonth();
          this.eventYear = eventDate.getFullYear();
      
          if (this.eventYear === currentYear && eventMonth <= currentMonth) {
              let month = allMonths[eventMonth];
              this.eventsByMonth[`${month}-${this.eventYear}`]++;
          }
      });
      console.log('Statistik der Events nach Monat:', this.eventsByMonth);
  }

  createBarChart() {
      let ctx = this.barCanvas.nativeElement.getContext('2d');
      let allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let currentDate = new Date();
      let currentMonthIndex = currentDate.getMonth();
      let dynamicLabels = allMonths.slice(currentMonthIndex + 1).concat(allMonths.slice(0, currentMonthIndex + 1));
      
      this.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dynamicLabels,
          datasets: [{
            label: 'Patients Overview',
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
                    stepSize: 1
                  },
                  min: 0,
                  max: 10,
                  grid: {
                    color: 'rgb(1,103,175)' // Farbe der Gitterlinien der Y-Achse
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
        const [month, year] = label.split('-');
        return `${month} ${year.slice(2)}`;
      });
  
      this.barChart.data.datasets[0].data = Object.values(this.eventsByMonth);
      this.barChart.update();
    }
  }
}




