import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from './components/device/dashboard/dashboard.component';
import {VehicleDashboardComponent} from './components/vehicle/vehicle-dashboard/vehicle-dashboard.component';

const routes: Routes = [
  {path: '', redirectTo: '/fdm/dashboard', pathMatch: 'full'},
  {
    path: 'fdm',
    children: [
      { path: 'dashboard', component: DashboardComponent},
      { path: 'dashboard/vehicle', component: VehicleDashboardComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
