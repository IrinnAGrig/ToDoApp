import { Component } from '@angular/core';
import { AuthService } from './shared/services/auth/auth.service';
import { UserDetails } from './shared/services/auth/auth.model';
import { ActivityService } from './shared/services/activities/activities.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  user: UserDetails | null = null;
  constructor(private authService: AuthService, private activityService: ActivityService) { }

  ngOnInit(): void {
    this.authService.autoLogin();
    this.authService.userDetails.subscribe(res => {
      this.user = res;
      this.activityService.deleteDefiniveActivities(this.user.id).subscribe(() => console.log('completed'));
    });
  }
  logout() {
    this.authService.logout();
    this.authService.userDetails.subscribe(res => {
      this.user = res;
    });
  }
}
