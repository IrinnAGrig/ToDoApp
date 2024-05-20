import { Component } from '@angular/core';
import { Activity, FiltersActivity } from '../shared/services/activities/activities.model';
import { ActivityService } from '../shared/services/activities/activities.service';
import { AuthService } from '../shared/services/auth/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { month } from '@igniteui/material-icons-extended';

interface DataPriorities {
  lowPriority: Activity[],
  mediumPriority: Activity[],
  highPriority: Activity[]
}

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent {
  userId: string = '';
  activities: Activity[] = [];
  activitiesPriority: DataPriorities = { lowPriority: [], mediumPriority: [], highPriority: [] };
  selectedActivity: Activity | null = null;

  formFilters: FormGroup;
  cardForm: FormGroup;
  isAddingActivity = false;
  isEditingActivity = false;

  pagedActivities: Activity[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  sortedElement: {
    element: keyof Activity,
    direction: 'nor' | 'asc' | 'desc'
  } = {
      element: 'title',
      direction: 'nor'
    };
  activeMonth: { isActive: boolean, noChange: boolean } = { isActive: true, noChange: true };
  hovered = false;

  constructor(private activityService: ActivityService, private authService: AuthService) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const formattedMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

    this.formFilters = new FormGroup({
      date: new FormControl(""),
      month: new FormControl(formattedMonth),
      priority: new FormControl(false),
      isCompleted: new FormControl("any"),
      isActive: new FormControl(false),
    });
    this.authService.userDetails.subscribe(res => {
      this.userId = res.id;
      let temp: FiltersActivity = { date: "", month: formattedMonth, isCompleted: 'any', isActive: false }
      this.getActivities(temp);
    });

    this.formFilters.valueChanges.subscribe(value => {
      if (this.activeMonth.noChange) {
        const filtersActivity: FiltersActivity = {
          date: value.date,
          month: value.month,
          isActive: value.isActive,
          isCompleted: value.isCompleted,
        };

        if (value.priority) {
          this.activitiesPriority.lowPriority = this.activities.filter(el => el.priority == 'Low');
          this.activitiesPriority.mediumPriority = this.activities.filter(el => el.priority == 'Medium');
          this.activitiesPriority.highPriority = this.activities.filter(el => el.priority == 'High');
        }


        this.getActivities(filtersActivity);
      } else {
        this.activeMonth.noChange = true;
      }
    });

    this.cardForm = new FormGroup({
      title: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      time: new FormControl(1, Validators.required),
      date: new FormControl("", Validators.required),
      priority: new FormControl("Low", Validators.required),
    });
  }

  getPagedData(data: Activity[]) {
    this.pagedActivities = data.slice((this.currentPage - 1) * this.itemsPerPage, (this.currentPage - 1) * this.itemsPerPage + this.itemsPerPage);
  }
  handlePageChange(pageNumber: number) {
    this.currentPage = pageNumber;
    this.getPagedData(this.activities);
  }

  toggleForm() {
    this.isAddingActivity = !this.isAddingActivity;
    if (this.isAddingActivity) {
      this.formFilters.disable();
    } else {
      this.formFilters.enable();
    }
    this.cardForm.reset();
  }
  getDateForInputTypeDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  onDrop(event: CdkDragDrop<Activity[]>, prior: 'High' | 'Medium' | 'Low') {
    let movedItem: Activity;
    if (event.previousContainer === event.container) {
      movedItem = event.container.data[event.previousIndex];
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      movedItem = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    movedItem.priority = prior;
    this.activityService.editActivity(movedItem).subscribe();
  }


  getActivities(value: FiltersActivity) {
    this.activityService.getActivities(this.userId, value, this.activeMonth.isActive).subscribe(res => {
      this.activities = res;
      this.getPagedData(this.activities);
      this.activitiesPriority.lowPriority = this.activities.filter(el => el.priority == 'Low');
      this.activitiesPriority.mediumPriority = this.activities.filter(el => el.priority == 'Medium');
      this.activitiesPriority.highPriority = this.activities.filter(el => el.priority == 'High');
    })
  }
  changeTypeGetActivities() {
    this.activeMonth.isActive = !this.activeMonth.isActive;
    this.activeMonth.noChange = false;
    if (this.activeMonth.isActive) {
      this.formFilters.patchValue({ date: "" });
    } else {
      this.formFilters.patchValue({ month: "" });
    }
    this.hovered = false;
  }

  selectActivity(activity: Activity) {
    this.selectedActivity = activity;
  }

  submit() {
    const formData = this.cardForm.value;
    const dateParts = formData.date.split('-');
    const activity: Activity = {
      id: this.isAddingActivity ? '' : this.selectedActivity ? this.selectedActivity.id : '',
      idUser: this.userId,
      description: formData.description,
      title: formData.title,
      date: +dateParts[2],
      month: +dateParts[1],
      year: +dateParts[0],
      priority: formData.priority,
      timeForCompletion: formData.time,
      isActive: true,
      isCompleted: false,
      dateCreated: this.formatDate(new Date()),
      timeToBeDeleted: ''
    };
    if (this.isAddingActivity) {
      this.activityService.addActivity(activity).subscribe(() => {
        this.activities.push(activity);
        this.isAddingActivity = false;
        this.updateTable();
      });
    } else {
      this.activityService.editActivity(activity).subscribe(() => {
        this.isEditingActivity = false;
        this.isAddingActivity = false;
        this.selectedActivity = activity;
        this.updateTable();
      });
    }
    this.formFilters.enable();
  }
  enterEditMode() {
    this.isEditingActivity = true;
    if (this.selectedActivity) {
      const selectedDate = new Date(this.selectedActivity.year, this.selectedActivity.month - 1, this.selectedActivity.date);
      const formattedDate = this.formatDateInput(selectedDate);
      this.cardForm.setValue({
        title: this.selectedActivity.title,
        time: this.selectedActivity.timeForCompletion,
        description: this.selectedActivity.description,
        date: formattedDate,
        priority: this.selectedActivity.priority
      });
    }
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
  }
  formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  updateTable() {
    const value = this.formFilters.value;
    const filtersActivity: FiltersActivity = {
      date: value.date,
      month: value.month,
      isActive: value.isActive,
      isCompleted: value.isCompleted
    };
    this.getActivities(filtersActivity);
  }
  deleteActivity() {
    let conf = confirm('Are you sure you want to delete this activity?');
    if (conf && this.selectedActivity) {
      this.activityService.inactivateActivity(this.selectedActivity).subscribe(() => {
        this.updateTable()
        this.selectedActivity = null;
      });
    }
  }
  setDone(type: boolean) {
    if (this.selectedActivity)
      this.activityService.setStatusActivity(this.selectedActivity, type).subscribe(() => this.updateTable());
  }
  restoreActivity() {
    if (this.selectedActivity) {
      this.activityService.restoreActivity(this.selectedActivity).subscribe(() => {
        this.updateTable();
        this.selectedActivity = null;
      });
    }
  }
  sortTable(field: keyof Activity): void {
    if (this.sortedElement.element === field) {
      this.sortedElement.direction = this.sortedElement.direction === 'asc' ? 'desc' : (this.sortedElement.direction == 'desc' ? 'nor' : 'asc');
    } else {
      this.sortedElement.element = field;
      this.sortedElement.direction = 'asc';
    }
    if (this.sortedElement.direction != 'nor') {
      this.activities.sort((a, b) => {
        const aValue = field === 'date' ? this.combineDate(a.date, a.month, a.year) : a[this.sortedElement.element];
        const bValue = field === 'date' ? this.combineDate(b.date, b.month, b.year) : b[this.sortedElement.element];
        return this.sortedElement.direction === 'asc' ? (aValue > bValue ? 1 : -1) : (bValue > aValue ? 1 : -1);
      });
      this.getPagedData(this.activities);
    } else {
      this.getPagedData(this.activities);
    }
  }

  combineDate(date: number, month: number, year: number): number {
    return new Date(year, month - 1, date).getTime();
  }

}
