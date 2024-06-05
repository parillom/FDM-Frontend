import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Vehicle} from '../../models/Vehicle';
import {Location} from '../../models/Location';
import {DeviceState} from '../../models/DeviceState';

@Component({
  selector: 'app-vehicle-location-autocompletion',
  templateUrl: './vehicle-location-autocompletion.component.html',
  styleUrl: './vehicle-location-autocompletion.component.scss'
})
export class VehicleLocationAutocompletionComponent implements AfterViewInit{
  @ViewChild('vehicleSearch') vehicleSearch!: ElementRef<HTMLInputElement>;
  @ViewChild('locationSearch') locationSearch!: ElementRef<HTMLInputElement>;

  @Output()
  filterByVehicleName: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  filterByLocationName: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  showAllDevices: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input()
  vehicles?: Vehicle[];

  @Input()
  locations?: Location[];

  stateIsActive: boolean = false;
  currentState: DeviceState | undefined;
  filteredVehicles?: Vehicle[];
  filteredLocations?: Location[];
  showInputs: boolean = true;

  @Input()
  set currentStateValue(state: DeviceState | undefined) {
    this.showAllDevices.emit(true);
    this.currentState = state;
    if (this.currentState) {
      this.showInputs = false;
    }
    this.stateIsActive = this.currentState === DeviceState.ACTIVE;
  }

  ngAfterViewInit() {

  }

  filter(isVehicleSearch: boolean): void {
    if (this.locationSearch && this.vehicleSearch && this.locationSearch.nativeElement.value.trim() === '' && this.vehicleSearch.nativeElement.value.trim() === '') {
      this.showAllDevices.emit(true);
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
    if (nameIsVehicle) {
      this.filterByVehicleName.emit(name);
    } else {
      this.filterByLocationName.emit(name);
    }
  }

}
