import { Component } from '@angular/core';
import { AuthService } from '../shared/services/auth/auth.service';
import { Activity } from '../shared/services/activities/activities.model';
import { ActivityService } from '../shared/services/activities/activities.service';

@Component({
  selector: 'app-report-activities',
  templateUrl: './report-activities.component.html',
  styleUrls: ['./report-activities.component.css']
})
export class ReportActivitiesComponent {
  year: number = new Date().getFullYear();
  currentMonthIndex: number = new Date().getMonth();
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];
  activities: Activity[] = [];
  userId = "";

  data: any[] = [];
  barData: any[] = [];
  layout?: {};
  barLayout?: {};

  numbers: number[] = [];
  totalDays: number[] = [];
  time: { completed: number, uncompleted: number } = { completed: 0, uncompleted: 0 };
  hoursNeededForCompletion: number = 0;
  completionProgress: string = '';


  constructor(private authService: AuthService, private activityService: ActivityService) {
    this.authService.userDetails.subscribe(res => {
      this.userId = res.id;
      this.getActivitiesByMonth();
    });
  }

  getActivitiesByMonth() {
    this.numbers = [];
    this.activityService.getActivitiesByMonth(this.userId, this.currentMonthIndex + 1, this.year).subscribe(res => {
      this.activities = res;

      let days = this.getDaysInMonth(this.year, this.currentMonthIndex + 1);

      for (let i = 1; i <= days; i++) {
        this.numbers.push(i);
      }
      this.totalDays = this.numbers.slice();
      this.time = { completed: 0, uncompleted: 0 };
      this.setPieChartData();
      this.setBarChartData();

      this.activities.forEach(act => {
        if (this.numbers.includes(act.date)) {
          days--;
          const index = this.numbers.indexOf(act.date);
          if (index !== -1) {
            this.numbers.splice(index, 1);
          }
        }
      });

    });
  }
  setPieChartData() {
    let completed = this.activities.filter(t => t.isCompleted).length;
    let unCompleted = this.activities.filter(t => !t.isCompleted).length;
    this.completionProgress = ((completed / this.activities.length) * 100).toFixed(2);
    this.data = [{
      values: [completed, unCompleted],
      labels: ['Completed(' + completed + ')', 'Non-completed(' + unCompleted + ')'],
      type: 'pie',
      marker: {
        colors: ['green', '#A91D3A']
      }
    }];

    this.layout = {
      height: 300,
      width: 400,
      margin: { l: 50, r: 50, t: 10, b: 10 }
    };
  }
  setBarChartData() {
    let numberDays = this.totalDays;

    let barDatas: number[][] = [];

    for (let i = 0; i < 2; i++) {
      barDatas[i] = [];
      for (let j = 0; j < numberDays.length; j++) {
        barDatas[i][j] = 0;
      }
    }
    barDatas[1] = this.getDataBar(numberDays, true);
    this.activities.forEach(act => {
      if (!act.isCompleted) {
        barDatas[0][act.date - 1]++;
        this.time.uncompleted += act.timeForCompletion;
      }
    })

    var trace1 = {
      x: numberDays,
      y: barDatas[1],
      type: 'bar',
      name: 'Completed',
      marker: {
        color: 'green'
      }
    };

    var trace2 = {
      x: numberDays,
      y: barDatas[0],
      name: 'Uncompleted',
      type: 'bar',
      marker: {
        color: '#A91D3A'
      }
    };
    this.barData = [trace1, trace2];
    this.barLayout = {
      barmode: 'stack',
      height: 250,
      with: 300,
      margin: { l: 50, r: 50, t: 10, b: 20 }
    };
  }

  getDataBar(numberDays: number[], isCompleted: boolean): number[] {
    let array: number[] = [];
    for (let i = 0; i < numberDays.length; i++) {
      array[i] = 0;

    }
    this.activities.forEach(act => {
      if (isCompleted) {
        if (act.isCompleted) {
          array[act.date - 1]++;
          this.time.completed += act.timeForCompletion;
        }

      } else {
        array[act.date - 1]++;
      }
    })
    return array;
  }

  getDaysInMonth(year: number, month: number): number {
    const nextMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(nextMonth.getTime() - 1);
    return lastDayOfMonth.getDate();
  }

  changeMonth(delta: number) {
    this.completionProgress = '';
    this.currentMonthIndex = (this.currentMonthIndex + delta + 12) % 12;
    if (delta == 1) {
      if (this.currentMonthIndex == 0) {
        this.year++;
      }
    } else {
      if (this.currentMonthIndex == 11) {
        this.year--;
      }
    }
    this.getActivitiesByMonth();
  }

  getCurrentMonthName(): string {
    return this.months[this.currentMonthIndex];
  }
}
