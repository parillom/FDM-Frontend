import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Vehicle} from '../../../models/Vehicle';
import {VehicleService} from '../../../services/vehicle.service';
import {ResponseHandlerService} from '../../../services/response-handler.service';

@Component({
  selector: 'app-user-vehicle-dashboard',
  templateUrl: './user-vehicle-dashboard.component.html',
  styleUrl: './user-vehicle-dashboard.component.scss'
})
export class UserVehicleDashboardComponent implements OnInit {
  vehicles: Vehicle[] = [];
  firstSixVehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  rendered: boolean;

  constructor(private router: Router,
              private vehicleService: VehicleService,
              private responseHandler: ResponseHandlerService) {
  }

  ngOnInit() {
    this.getVehicles();
  }

  navigateToDashboard() {
    void this.router.navigate(['/fdm/user/dashboard']);
  }

  private getVehicles() {
    this.rendered = false;
    this.vehicleService.getAll().subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.vehicles = res.object;
        const desiredNames = ['TLF12', 'TLF14', 'TLF13', 'TLF15', 'ADL17', 'ADL18'];
        this.firstSixVehicles = this.vehicles
          .filter(vehicle => desiredNames.some(name => name === vehicle.name));

        this.filteredVehicles = this.vehicles;

        this.rendered = true;
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage);
      }
    });
  }

  filterVehicles(event: any) {
    this.filteredVehicles = this.vehicles?.filter(vehicle => vehicle.name.toLowerCase().includes(event.target.value.toLowerCase()));
  }

  navigateToEdit(vehicle: Vehicle) {
    void this.router.navigate(['/fdm/user/vehicles/edit'], {queryParams: {id: vehicle.uuid, admin: false}});
  }
}
