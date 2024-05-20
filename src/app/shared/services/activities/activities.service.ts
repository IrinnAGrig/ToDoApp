import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, forkJoin, switchMap } from "rxjs";
import { Router } from "@angular/router";
import { Activity, FiltersActivity } from "./activities.model";
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root',
})
export class ActivityService {

    url = "http://localhost:3000/activities";

    constructor(private http: HttpClient, private router: Router) {

    }
    getActivities(id: string, values: FiltersActivity, activeMonth: boolean): Observable<Activity[]> {
        let date = "";
        if (activeMonth) {
            if (values.month != "") {
                const year = parseInt(values.month.substring(0, 4));
                const month = parseInt(values.month.substring(5, 7));
                date = values.month ? `&&month=${month}&&year=${year}` : "";
            }
        } else {
            if (values.date != "") {
                const dateParts = values.date.split('-');
                date = values.date ? `&&date=${dateParts[2]}&&month=${dateParts[1]}&&year=${dateParts[0]}` : "";
            }
        }

        let isCompleted = values.isCompleted != "any" ? `&&isCompleted=${values.isCompleted == "false" ? "0" : "1"}` : "";
        let isActive = !values.isActive ? `&&isActive=1` : "&&isActive=0";
        return this.http.get<Activity[]>(`${this.url}?idUser=${id}` + date + isCompleted + isActive);
    }
    getActivitiesMonthFilters(id: string, values: FiltersActivity): Observable<Activity[]> {
        let date = "";
        if (values.date) {
            const dateParts = values.date.split('-');
            date = values.date ? `&&month=${dateParts[1]}&&year=${dateParts[0]}` : "";
        }
        let isCompleted = values.isCompleted != "any" ? `&&isCompleted=${values.isCompleted == "false" ? "0" : "1"}` : "";
        let isActive = !values.isActive ? `&&isActive=1` : "&&isActive=0";
        return this.http.get<Activity[]>(`${this.url}?idUser=${id}` + date + isCompleted + isActive);
    }
    getActivitiesByMonth(id: string, month: number, year: number) {
        return this.http.get<Activity[]>(`${this.url}?idUser=${id}&&month=${month}&&year=${year}&&isActive=1`);
    }
    addActivity(activity: Activity): Observable<boolean> {
        activity.id = this.generateId(activity);
        return this.http.post<boolean>(`${this.url}`, activity);
    }
    editActivity(activity: Activity): Observable<boolean> {
        return this.http.put<boolean>(`${this.url}/${activity.id}`, activity);
    }
    setStatusActivity(activity: Activity, type: boolean): Observable<boolean> {
        activity.isCompleted = type;
        return this.http.put<boolean>(`${this.url}/${activity.id}`, activity);
    }
    inactivateActivity(activity: Activity): Observable<boolean> {
        activity.isActive = false;
        const currentDate = new Date();
        const futureDate = new Date(currentDate);
        futureDate.setDate(currentDate.getDate() + 30);

        activity.timeToBeDeleted = futureDate.toDateString();
        return this.http.put<boolean>(`${this.url}/${activity.id}`, activity);
    }

    generateId(activity: Activity): string {
        const data = activity.idUser + activity.title + activity.description;
        const hash = CryptoJS.SHA256(data).toString();
        return hash;
    }
    restoreActivity(activity: Activity): Observable<boolean> {
        activity.isActive = true;
        activity.timeToBeDeleted = "";
        return this.http.put<boolean>(`${this.url}/${activity.id}`, activity);
    }
    deleteActivity(id: string): Observable<boolean> {
        return this.http.delete<boolean>(`${this.url}/${id}`);
    }
    deleteDefiniveActivities(id: string): Observable<any> {
        return this.http.get<Activity[]>(`${this.url}?idUser=${id}&&isActive=0`).pipe(
            switchMap(activities => {
                const currentDate = new Date();
                const deletionObservables = activities
                    .filter(data => new Date(data.timeToBeDeleted) <= currentDate)
                    .map(activity => this.deleteActivity(activity.id));

                return forkJoin(deletionObservables);
            })
        );
    }
}