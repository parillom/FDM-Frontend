import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from './components/device/dashboard/dashboard.component';
import {VehicleDashboardComponent} from './components/vehicle/vehicle-dashboard/vehicle-dashboard.component';
import {DeviceDetailsComponent} from './components/device/device-details/device-details.component';
import {VehicleEditComponent} from './components/vehicle/vehicle-edit/vehicle-edit.component';
import {LocationDashboardComponent} from './components/location/location-dashboard/location-dashboard.component';
import {TestComponent} from './components/test/test.component';
import {DeviceWorkflowComponent} from './components/device/device-workflow/device-workflow.component';
import {LocationEditComponent} from './components/location/location-edit/location-edit.component';

const routes: Routes = [
  {path: '', redirectTo: '/fdm/dashboard', pathMatch: 'full'},
  {
    path: 'fdm',
    children: [
      { path: 'dashboard', component: DashboardComponent},
      { path: 'dashboard/device', component: DeviceDetailsComponent},
      { path: 'dashboard/device/workflow', component: DeviceWorkflowComponent},
      { path: 'dashboard/vehicle', component: VehicleDashboardComponent},
      { path: 'dashboard/vehicle/edit', component: VehicleEditComponent},
      { path: 'dashboard/location/edit', component: LocationEditComponent},
      { path: 'dashboard/location', component: LocationDashboardComponent},
      { path: 'dashboard/test', component: TestComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
