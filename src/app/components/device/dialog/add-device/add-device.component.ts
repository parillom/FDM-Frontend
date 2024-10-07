import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Device} from '../../../../models/Device';
import {Location} from '../../../../models/Location';
import {MatDialogRef} from '@angular/material/dialog';
import {LocationService} from '../../../../services/location.service';
import {Vehicle} from '../../../../models/Vehicle';
import {VehicleService} from '../../../../services/vehicle.service';
import {DeviceState} from '../../../../models/DeviceState';
import {DeviceService} from '../../../../services/device.service';
import {ErrorHandlerService} from '../../../../services/error-handler.service';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {CreateDevice} from '../../../../models/CreateDevice';
import {StorageType} from '../../../../models/StorageType';

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
  devicesToSave: CreateDevice[] = [];
  filteredVehicles?: Vehicle[] = [];
  addOneDevice: boolean = true;
  locationSelected: boolean = false;
  isSubmitting: boolean = false;
  dragDisabled = false;

  locations: Location[] = [];
  vehicles: Vehicle[] = [];

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() createdSuccessful = new EventEmitter<boolean>();
  @Output() manyCreatedSuccessful = new EventEmitter<boolean>();

  deviceFormVehicle: FormGroup = new FormGroup({
    name: new FormControl(null, Validators.required),
    vehicle: new FormControl<string | null>(null, Validators.required),
    state: new FormControl('', Validators.required),
  });

  deviceFormLocation: FormGroup = new FormGroup({
    name: new FormControl(null, Validators.required),
    location: new FormControl<string | null>(null, Validators.required),
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
    this.locationService.getAll().subscribe(res => {
      if (res && !this.errorHandler.hasError(res)) {
        this.locations = res.object;
        this.filteredLocations = this.locations;
      } else {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  private getVehicles() {
    this.vehicleService.getAll().subscribe(res => {
      if (this.errorHandler.hasError(res)) {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      } else {
        this.vehicles = res.object;
        this.filteredVehicles = this.vehicles;
      }
    });
  }

  setLocationInput(location: Location) {
    this.deviceFormLocation.patchValue({
      location: location.name
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
    if (this.deviceFormLocation.valid) {
      this.devicesToSave = [];

      const locationForm = this.deviceFormVehicle.value;

      let location = {} as Location;

      //getting the current location
      this.locationService.getLocationByName(locationForm.vehicle).subscribe(res => {
        if (this.errorHandler.hasError(res)) {
          this.errorHandler.setErrorMessage(res.errorMessage);
          return;
        } else {
          location = res.object;
        }

        const device: CreateDevice = {
          name: locationForm.name,
          storageId: location.uuid,
          state: locationForm.state,
          storageType: StorageType.LOCATION
        };

        this.devicesToSave.push(device);

        this.performSaveCall(this.devicesToSave);
      });
    }
  }

  createDeviceWithVehicle() {
    if (this.deviceFormVehicle.valid) {
      this.devicesToSave = [];

      const vehicleForm = this.deviceFormVehicle.value;

      let vehicle = {} as Vehicle;

      // getting the current Vehicle
      this.vehicleService.getVehicleByName(vehicleForm.vehicle).subscribe(res => {
        if (this.errorHandler.hasError(res)) {
          this.errorHandler.setErrorMessage(res.errorMessage);
          return;
        } else {
          vehicle = res.object;
        }

        const device: CreateDevice = {
          name: vehicleForm.name,
          storageId: vehicle.uuid,
          state: DeviceState.ACTIVE,
          storageType: StorageType.VEHICLE
        };

        this.devicesToSave.push(device);

        this.performSaveCall(this.devicesToSave);
      });
    }
  }

  performSaveCall(devices: CreateDevice[]) {
    this.deviceService.create(devices).subscribe(res => {
      if (this.errorHandler.hasError(res)) {
        this.errorHandler.setErrorMessage(res.errorMessage!);
        this.createdSuccessful.emit(false);
        this.isSubmitting = false;
      } else {
        this.errorHandler.setSuccessMessage(`Gerät ${res.object.name} erfolgreich erstellt!`);
        this.createdSuccessful.emit(true);
        this.clearNameInput();
        this.getLocations();
        this.getVehicles();
        this.isSubmitting = false;
      }
    });
  }

  clearNameInput() {
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

  disableDrag() {
    this.dragDisabled = true;
  }

  enableDrag() {
    this.dragDisabled = false;
  }
}
