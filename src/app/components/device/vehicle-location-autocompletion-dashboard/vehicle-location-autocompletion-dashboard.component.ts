import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Vehicle} from '../../../models/Vehicle';
import {Location} from '../../../models/Location';
import {DeviceState} from '../../../models/DeviceState';
import {DeviceSearch} from '../../../models/DeviceSearch';
import {StorageType} from '../../../models/StorageType';

@Component({
  selector: 'app-vehicle-location-autocompletion-dashboard',
  templateUrl: './vehicle-location-autocompletion-dashboard.component.html',
  styleUrl: './vehicle-location-autocompletion-dashboard.component.scss'
})
export class VehicleLocationAutocompletionDashboardComponent {
  @Output()
  filterByVehicleName: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  filterByLocationName: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  doFilter: EventEmitter<DeviceSearch | null> = new EventEmitter<DeviceSearch | null>();

  @Input()
  vehicles: Vehicle[] = [];

  @Input()
  locations: Location[] = [];

  enableVehicleInput: boolean = false;
  enableLocationInput: boolean = false;
  currentState: DeviceState | undefined;
  protected readonly StorageType = StorageType;
  showInputs: boolean = true;
  deviceCriteria?: DeviceSearch;
  vehicleName: string = '';
  locationName: string = '';

  @Input()
  set currentStateValue(state: DeviceState | undefined) {
    this.currentState = state;
    this.enableVehicleInput = this.currentState === DeviceState.ACTIVE || this.currentState === undefined;
    this.enableLocationInput = this.currentState === DeviceState.REESTABLISH || this.currentState === DeviceState.STORAGE || this.currentState === undefined;
  }

  resetFields() {
    this.vehicleName = undefined;
    this.locationName = undefined;
    this.showInputs = true;
  }

  filter(): void {
    this.deviceCriteria = {
      state: this.currentState,
      vehicleName: this.vehicleName,
      locationName: this.locationName,
    };

    this.doFilter.emit(this.deviceCriteria);
  }

  resetLocationName() {
    this.locationName = undefined;
    this.filter();
  }

  resetVehicleName() {
    this.vehicleName = undefined;
    this.filter();
  }

  filterAfterOptionClick(storageName: string, type: StorageType) {
    if (type === StorageType.VEHICLE) {
      this.deviceCriteria = {
        state: this.currentState,
        vehicleName: storageName,
        locationName: undefined,
      };
    } else {
      this.deviceCriteria = {
        state: this.currentState,
        vehicleName: undefined,
        locationName: storageName,
      };
    }

    this.doFilter.emit(this.deviceCriteria);
  }
}
