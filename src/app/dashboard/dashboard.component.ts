import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { Events } from '../models/events.class';
import { Chart, registerables } from 'chart.js';
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
    currentMonthForHTML: string | null = null;
    patientsThisMonth: number = 0;
    patientsLastMonth: number = 0;
    percentageChange: number = 0;
    percentageChangeDisplay: string = '';
    percentageChangeColor: string = '';
    selectedYear: number = new Date().getFullYear();
    

    constructor(private router: Router) {
        this.unsubUserList = this.subUsersList();
        this.unsubEventList = this.subEventsList();
        this.generateCalendar();
        Chart.register(...registerables);
    }

  
    ngAfterViewInit() {
        this.createBarChart();
        this.subEventsList().then(() => {
            this.calculatePatientsAndPercentageChange();
        });
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
        return new Promise<void>((resolve) => {
            onSnapshot(this.getEventsRef(), (list) => {
                this.eventsList = [];
                list.forEach(element => {
                    this.eventsList.push(new Events().setEventsObject(element.data(), element.id));
                });
                this.updateEventsByMonth();
                this.updateBarChart();
                resolve(); 
            });
        });
    }

    ngOnDestroy(){
        this.unsubUserList();
    }

    getUserRef() {
        return collection(this.firestore, 'users');
    } 

    getEventsRef() {
        return collection(this.firestore, 'events');
    }

    updateEventsByMonth() {
        this.eventsByMonth = Object.fromEntries(this.allMonths.map(month => [`${month}-${this.eventYear}`, 0]));
        this.eventsList.forEach(event => {
            let eventDate = new Date(event.day);
            let eventMonth = eventDate.getMonth();
            let eventYear = eventDate.getFullYear();
            let month = this.allMonths[eventMonth];
            let key = `${month}-${eventYear}`;
            if (this.eventsByMonth[key] !== undefined) {
                this.eventsByMonth[key]++;
            }
        });
    }

    createBarChart() {
        let ctx = this.barCanvas.nativeElement.getContext('2d');
        let barThickness = this.calculateBarThickness();
        let fontSize = this.calculateFontSize();
        

        this.barChart = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: this.allMonths,
            datasets: [{
                data:  Object.values(this.eventsByMonth),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                barThickness: barThickness
            }],
            },
            options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'lightgrey',
                        stepSize: 10,
                        font: {
                        size: fontSize
                    }
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgb(1,103,175)'
                    },
                },
                x: {
                    ticks: {
                        color: 'lightgrey',
                        maxRotation: 0,
                        minRotation: 0,
                        font: {
                        size: this.calculateFontSize()
                    }
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

    calculateBarThickness(): number {
        let baseThickness = 30;
        let mobileThreshold = 768;
        let mobileThickness = 10;
        return window.innerWidth < mobileThreshold ? mobileThickness : baseThickness;
    }

    calculateFontSize(): number {
        let minWidth = 8;
        let maxWidth = 20;
        let baseWidth = 0.8214;
        let viewportWidthFactor = 0.02;
        let calculatedFontSize = Math.max(minWidth, Math.min(maxWidth, baseWidth + viewportWidthFactor * window.innerWidth));
        return calculatedFontSize;
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

    updateYear(offset: number): void {
        this.eventYear += offset;
        this.updateEventsByMonth();
        this.updateBarChart();
    }

    previousYear(): void {
        this.updateYear(-1);
    }

    nextYear(): void {
        this.updateYear(1);
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
        this.calculatePatientsAndPercentageChange();
    }

    setFormattedMonth() {
        let datePipe: DatePipe = new DatePipe('en-US');
        this.formattedMonth = datePipe.transform(this.currentMonth, 'MMMM yyyy');
        this.currentMonthForHTML = datePipe.transform(this.currentMonth, 'MMMM');
    }
    
    isToday(date: Date | null): boolean {
        if (date) {
            let today = new Date();
            if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
                return true;
            }
            if (date.getDay() === 6 && date.getDate() === today.getDate()) {
                return true;
            }
            if (date.getDay() === 0 && date.getDate() === today.getDate()) {
                return true;
            }
        }
        return false; 
    }
    
    changeMonth(offset: number): void {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + offset);
        this.generateCalendar();
        this.updateSelectedYear();
    }

    calculateEventsForSelectedMonth(selectedYear: number, selectedMonthIndex: number): number {
        return this.eventsList.filter(event => {
          const eventDate = new Date(event.day);
          return (
            eventDate.getMonth() === selectedMonthIndex &&
            eventDate.getFullYear() === selectedYear
          );
        }).length;
      }

    updateSelectedYear() {
        this.selectedYear = this.currentMonth.getFullYear();
        this.updateEventsByMonth();
        this.updateBarChart();
    }
  
    previousMonth() {
        this.changeMonth(-1);
    }
    
    nextMonth() {
        this.changeMonth(1);
    }

    navigateToDay(day: Date) {
        let formattedDate = this.datePipe.transform(day, 'yyyy-MM-dd');
        this.router.navigate(['/calendar'], { queryParams: { selectedDate: formattedDate } });
    }

    calculatePatientsAndPercentageChange(): void {
        let currentMonthIndex = this.currentMonth.getMonth();
        let currentYear = this.currentMonth.getFullYear();
        let previousMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
        let previousYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
        let currentMonthEvents = this.calculateEventsForSelectedMonth(currentYear, currentMonthIndex);
        let previousMonthEvents = this.calculateEventsForSelectedMonth(previousYear, previousMonthIndex);
      
        this.patientsThisMonth = currentMonthEvents;
        this.patientsLastMonth = previousMonthEvents;
      
        let difference = currentMonthEvents - previousMonthEvents;
        let percentageChange = previousMonthEvents !== 0 ? (difference / Math.abs(previousMonthEvents)) * 100 : 0;
      
        this.percentageChange = Math.round(percentageChange * 100) / 100;
      
        if (previousMonthEvents === 0 && currentMonthEvents > 0) {
          this.percentageChange = 100;
        }
      
        this.percentageChangeDisplay = this.percentageChange > 0 ? `+${this.percentageChange}%` : `${this.percentageChange}%`;
        this.percentageChangeColor = this.percentageChange > 0 ? '#05fb4e' : this.percentageChange < 0 ? '#fb1005' : 'white';
    }
}





