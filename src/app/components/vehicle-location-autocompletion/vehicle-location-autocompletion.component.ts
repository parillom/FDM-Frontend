import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Vehicle} from '../../models/Vehicle';
import {Location} from '../../models/Location';
import {DeviceState} from '../../models/DeviceState';
import {DeviceSearch} from '../../models/DeviceSearch';

@Component({
  selector: 'app-vehicle-location-autocompletion',
  templateUrl: './vehicle-location-autocompletion.component.html',
  styleUrl: './vehicle-location-autocompletion.component.scss'
})
export class VehicleLocationAutocompletionComponent {
  @ViewChild('vehicleSearch') vehicleSearch!: ElementRef<HTMLInputElement>;
  @ViewChild('locationSearch') locationSearch!: ElementRef<HTMLInputElement>;

  @Output()
  filterByVehicleName: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  filterByLocationName: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  doFilter: EventEmitter<DeviceSearch | null> = new EventEmitter<DeviceSearch | null>();

  @Input()
  vehicles?: Vehicle[];

  @Input()
  locations?: Location[];

  stateIsActive: boolean = false;
  currentState: DeviceState | undefined;
  filteredVehicles?: Vehicle[];
  filteredLocations?: Location[];
  showInputs: boolean = true;
  deviceCriteria?: DeviceSearch;

  @Input()
  set currentStateValue(state: DeviceState | undefined) {
    this.currentState = state;
    if (this.currentState) {
      this.showInputs = false;
    }
    this.stateIsActive = this.currentState === DeviceState.ACTIVE;
  }

  resetFields() {
    this.vehicleSearch.nativeElement.value = '';
    this.locationSearch.nativeElement.value = '';
    this.showInputs = true;
  }

  filter(event: any, isVehicleSearch: boolean): void {
    if (!event.target.value && !this.currentState) {
      this.doFilter.emit(null)
    } else if (!event.target.value && this.currentState) {
      this.deviceCriteria = {
        state: this.currentState
      }
      this.doFilter.emit(this.deviceCriteria)
    }
    if (isVehicleSearch) {
      this.locationSearch.nativeElement.value = '';
      const filterValue = this.vehicleSearch.nativeElement.value.toLowerCase();
      this.filteredVehicles = this.vehicles!.filter(o => o.name?.toLowerCase().includes(filterValue));
    } else {
      this.vehicleSearch.nativeElement.value = '';
      const filterValue = this.locationSearch.nativeElement.value.toLowerCase();
      this.filteredLocations = this.locations!.filter(o => o.name?.toLowerCase().includes(filterValue));
    }
  }

  filterName(name: string | undefined, nameIsVehicle: boolean) {
    if (nameIsVehicle && this.currentState) {
      this.deviceCriteria = {
        state: this.currentState,
        vehicleName: name
      }
      this.doFilter.emit(this.deviceCriteria);
    }
    else if (nameIsVehicle && !this.currentState) {
      this.deviceCriteria = {
        state: null,
        vehicleName: name
      }
      this.doFilter.emit(this.deviceCriteria);
    }
    else if (!nameIsVehicle && this.currentState) {
      this.deviceCriteria = {
        state: this.currentState,
        locationName: name
      }
      this.doFilter.emit(this.deviceCriteria);
    }
    else if (!nameIsVehicle && !this.currentState) {
      this.deviceCriteria = {
        state: null,
        locationName: name
      }
      this.doFilter.emit(this.deviceCriteria);
    }
  }
}
