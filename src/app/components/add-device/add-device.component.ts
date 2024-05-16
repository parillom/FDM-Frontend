import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Device} from '../../models/Device';
import {Location} from '../../models/Location';
import {MatDialogRef} from '@angular/material/dialog';
import {LocationService} from '../../services/location.service';
import {Vehicle} from '../../models/Vehicle';
import {VehicleService} from '../../services/vehicle.service';
import {DeviceState} from '../../models/DeviceState';

@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.component.html',
  styleUrl: './add-device.component.scss',
})
export class AddDeviceComponent implements OnInit {

  device: Device = new Device();
  showLocations: boolean = false;
  showVehicles: boolean = false;
  filteredLocations?: Location[] = [];
  filteredVehicles?: Device[] = [];
  searchLocation: string = '';
  addOneDevice: boolean = true;
  showLocationInput: boolean = false;
  showVehicleInput: boolean = false;
  showStateSelector: boolean = false;

  locations?: Location[];
  vehicles?: Vehicle[];

  @Output() closeModalEvent = new EventEmitter<void>();

  createDeviceForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required),
    vehicle: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    searchLocation: new FormControl(''),
    searchVehicle: new FormControl(''),
  });

  constructor(public dialogRef: MatDialogRef<AddDeviceComponent>,
              private locationService: LocationService,
              private vehicleService: VehicleService) {
  }

  ngOnInit() {
    this.getLocations();
    this.getVehicles();
    this.onlyShowFirstFive();
  }

  private getLocations() {
    this.locationService.getAllLocations().subscribe(res => {
      if (res) {
        this.locations = res;
        this.filteredLocations = this.locations;
      }
    });
  }

  private getVehicles() {
    this.vehicleService.getAllVehicles().subscribe(res => {
      if (res) {
        this.vehicles = res;
        this.filteredVehicles = this.vehicles;
      }
    });
  }

  private onlyShowFirstFive() {
    this.filteredLocations = this.locations?.slice(0, 5);
  }

  filterLocations() {
    const searchLocation = this.createDeviceForm.get('searchLocation')?.value;
    this.filteredLocations = this.locations?.filter(location =>
      location.name!.toLowerCase().includes(searchLocation)
    );
  }

  filterVehicles() {
    const searchVehicle = this.createDeviceForm.get('searchVehicle')?.value;
    this.filteredVehicles = this.vehicles?.filter(location =>
      location.name!.toLowerCase().includes(searchVehicle)
    );
  }

  setLocationInput(device: Device) {
    this.createDeviceForm.patchValue({
      location: device.name
    });
    this.showLocations = false;
  }

  setVehicleInput(vehicle: Vehicle) {
    this.createDeviceForm.patchValue({
      vehicle: vehicle.name
    });
    this.showVehicles = false;
  }

  saveDevice() {
    if (this.createDeviceForm.valid) {
      const deviceData = this.createDeviceForm.value;
      delete deviceData.searchLocation;
      delete deviceData.searchVehicle;
      this.device = deviceData;
      console.log(this.device);
    }
  }

  handleVehicleClick() {
    this.showVehicles =! this.showVehicles;
    this.showVehicleInput = true;
    this.showLocationInput = false;
    this.showLocations = false;
    this.showStateSelector = true;
    this.createDeviceForm.get('vehicle')?.setValidators(Validators.required);
    this.handleLocationInput();
    this.setStateValue();

  }

  private handleLocationInput() {
    this.createDeviceForm.get('location')?.clearValidators();
    this.createDeviceForm.get('location')?.updateValueAndValidity();
    this.createDeviceForm.patchValue({
      location: ''
    });
  }

  handleLocationClick() {
    this.showLocations =! this.showLocations;
    this.showLocationInput = true;
    this.showVehicleInput = false;
    this.showVehicles = false;
    this.showStateSelector = true;
    this.createDeviceForm.get('location')?.setValidators(Validators.required);
    this.handleVehicleInput();
    this.setStateValue();
  }

  private handleVehicleInput() {
    this.createDeviceForm.get('vehicle')?.clearValidators();
    this.createDeviceForm.get('vehicle')?.updateValueAndValidity();
    this.createDeviceForm.patchValue({
      vehicle: ''
    });
  }

  private setStateValue() {
    if (this.showLocations) {
      this.createDeviceForm.patchValue({
        state: DeviceState.STORAGE
      });
    }
    if (this.showVehicles) {
      this.createDeviceForm.patchValue({
        state: DeviceState.ACTIVE
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
