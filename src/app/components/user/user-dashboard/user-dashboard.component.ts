import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {

  constructor(private router: Router) {
  }

  navigateToVehicles() {
    void this.router.navigate(['/fdm/user/vehicles']);
  }
}
