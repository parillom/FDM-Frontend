import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Device} from '../../../models/Device';
import {State} from '../../../models/State';
import {Location} from '../../../models/Location';
import {MatDialogRef} from '@angular/material/dialog';
import {LocationService} from '../../../services/location.service';
import {Vehicle} from '../../../models/Vehicle';
import {VehicleService} from '../../../services/vehicle.service';
import {DeviceState} from '../../../models/DeviceState';
import {DeviceService} from '../../../services/device.service';
import {ErrorHandlerService} from '../../../services/error-handler.service';
import {MatTabChangeEvent} from '@angular/material/tabs';

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
  locationSelected: boolean = false;
  isSubmitting: boolean = false;

  locations?: Location[];
  vehicles?: Vehicle[];

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() createdSuccessful = new EventEmitter<boolean>();
  @Output() manyCreatedSuccessful = new EventEmitter<boolean>();

  deviceFormVehicle: FormGroup = new FormGroup({
    name: new FormControl(null),
    vehicle: new FormControl<string | null>(null),
    state: new FormControl('', Validators.required),
  });

  deviceFormLocation: FormGroup = new FormGroup({
    name: new FormControl(null),
    location: new FormControl<string | null>(null),
    state: new FormControl('', Validators.required),
  });

  constructor(public dialogRef: MatDialogRef<AddDeviceComponent>,
              private locationService: LocationService,
              private vehicleService: VehicleService,
              private deviceService: DeviceService,
              private errorHandler: ErrorHandlerService) {
  }

  ngOnInit() {
    this.getLocations();
    this.getVehicles();
    this.setStateValue();
  }

  private getLocations() {
    this.locationService.getAllLocations().subscribe(res => {
      if (res && !this.errorHandler.hasError(res)) {
        this.locations = res.object;
        this.filteredLocations = this.locations;
      } else {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  private getVehicles() {
    this.vehicleService.getAllVehicles().subscribe(res => {
      if (this.errorHandler.hasError(res)) {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      } else {
        this.vehicles = res.object;
        this.filteredVehicles = this.vehicles;
      }
    });
  }

  setLocationInput(device: Device) {
    this.deviceFormLocation.patchValue({
      location: device.name
    });
    this.showLocations = false;
  }

  setVehicleInput(vehicle: Vehicle) {
    this.deviceFormVehicle.patchValue({
      vehicle: vehicle.name
    });
    this.showVehicles = false;
  }

  changeCreateFormat(event: MatTabChangeEvent) {
    if (event.index === 0) {
      this.addOneDevice = true;
    } else if (event.index === 1) {
      this.addOneDevice = false;
    }
  }

  changeToVehicleOrLocation(event: MatTabChangeEvent) {
    if (event.index === 0) {
      this.handleVehicleClick();
    } else {
      this.handleLocationClick();
    }
  }

  saveDevice() {
    if (this.locationSelected) {
      this.createDeviceWithLocation();
    } else {
      this.createDeviceWithVehicle();
    }
  }

  createDeviceWithLocation() {
    this.deviceFormLocation.get('name')?.setValidators(Validators.required);
    this.deviceFormLocation.get('name')?.updateValueAndValidity();
    this.deviceFormLocation.get('location')?.setValidators(Validators.required);
    this.deviceFormLocation.get('location')?.updateValueAndValidity();

    if (this.deviceFormLocation.valid) {
      const locationForm = this.deviceFormLocation.value;
      this.isSubmitting = true;

      const deviceToSave = {} as Device;
      deviceToSave.location = {} as Location;
      deviceToSave.vehicle = {} as Vehicle;
      deviceToSave.state = {} as State;
      deviceToSave.name = locationForm.name;
      deviceToSave.location.name = locationForm.location;
      deviceToSave.vehicle = null;
      deviceToSave.state.deviceState = locationForm.state;

      this.performSaveCall(deviceToSave);
    }
  }

  createDeviceWithVehicle() {
    this.deviceFormVehicle.get('name')?.setValidators(Validators.required);
    this.deviceFormVehicle.get('name')?.updateValueAndValidity();
    this.deviceFormVehicle.get('vehicle')?.setValidators(Validators.required);
    this.deviceFormVehicle.get('vehicle')?.updateValueAndValidity();
    if (this.deviceFormVehicle.valid) {
      const vehicleForm = this.deviceFormVehicle.value;

      const deviceToSave = {} as Device;
      deviceToSave.location = {} as Location;
      deviceToSave.vehicle = {} as Vehicle;
      deviceToSave.state = {} as State;
      deviceToSave.name = vehicleForm.name;
      deviceToSave.location = null;
      deviceToSave.vehicle.name = vehicleForm.vehicle;
      deviceToSave.state.deviceState = vehicleForm.state;

      this.performSaveCall(deviceToSave);
    }
  }

  performSaveCall(device: Device) {
    this.deviceService.addDevice(device).subscribe(res => {
      if (this.errorHandler.hasError(res)) {
        this.errorHandler.setErrorMessage(res.errorMessage!)
        this.createdSuccessful.emit(false);
        this.isSubmitting = false;
      } else {
        this.errorHandler.setSuccessMessage(`Gerät ${res.object.name} erfolgreich erstellt!`);
        this.createdSuccessful.emit(true);
        this.clearValidators();
        this.getLocations();
        this.getVehicles();
        this.isSubmitting = false;
      }
    });
  }

  clearValidators() {
    this.deviceFormVehicle.get('name')?.reset();
    this.deviceFormVehicle.get('name')?.clearValidators();
    this.deviceFormVehicle.get('name')?.updateValueAndValidity();

    this.deviceFormLocation.get('name')?.reset();
    this.deviceFormLocation.get('name')?.clearValidators();
    this.deviceFormLocation.get('name')?.updateValueAndValidity();
  }

  handleVehicleClick() {
    this.locationSelected = false;
    this.showVehicles = false;
    this.setStateValue();
  }

  handleVehicleList() {
    this.showVehicles = !this.showVehicles;
    this.filteredVehicles = this.vehicles?.slice(0, 5);
  }

  handleLocationClick() {
    this.locationSelected = true;
    this.showLocations = false;
    this.setStateValue();
  }

  showLocationsList() {
    this.showLocations = !this.showLocations;
  }


  public setStateValue() {
    if (this.locationSelected) {
      this.deviceFormLocation.patchValue({
        state: DeviceState.STORAGE
      });
    }
    if (!this.locationSelected) {
      this.deviceFormVehicle.patchValue({
        state: DeviceState.ACTIVE
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  resetForm() {
    if (this.locationSelected) {
      this.deviceFormLocation.reset();
    } else {
      this.deviceFormVehicle.reset();
    }
  }

  emitCreatedSuccessfullyValue(value: boolean) {
    this.manyCreatedSuccessful.emit(value);
  }
}
