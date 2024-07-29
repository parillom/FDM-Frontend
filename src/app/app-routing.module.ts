import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from './components/device/dashboard/dashboard.component';
import {VehicleDashboardComponent} from './components/vehicle/vehicle-dashboard/vehicle-dashboard.component';
import {DeviceDetailsComponent} from './components/device/device-details/device-details.component';
import {VehicleEditComponent} from './components/vehicle/vehicle-edit/vehicle-edit.component';

const routes: Routes = [
  {path: '', redirectTo: '/fdm/dashboard', pathMatch: 'full'},
  {
    path: 'fdm',
    children: [
      { path: 'dashboard', component: DashboardComponent},
      { path: 'dashboard/device', component: DeviceDetailsComponent},
      { path: 'dashboard/vehicle', component: VehicleDashboardComponent},
      { path: 'dashboard/vehicle/edit', component: VehicleEditComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
