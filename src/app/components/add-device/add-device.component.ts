import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Device} from '../../models/Device';
import {State} from '../../models/State';
import {Location} from '../../models/Location';
import {MatDialogRef} from '@angular/material/dialog';
import {LocationService} from '../../services/location.service';
import {Vehicle} from '../../models/Vehicle';
import {VehicleService} from '../../services/vehicle.service';
import {DeviceState} from '../../models/DeviceState';
import {DeviceService} from '../../services/device.service';
import {ToastrService} from 'ngx-toastr';
import {ModelAndError} from '../../models/ModelAndError';
import {ErrorHandlerService} from '../../services/error-handler.service';

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

  deviceForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    location: new FormControl<string | null>(null),
    vehicle: new FormControl<string | null>(null, Validators.required),
    state: new FormControl('', Validators.required),
    searchLocation: new FormControl(''),
    searchVehicle: new FormControl(''),
  });

  constructor(public dialogRef: MatDialogRef<AddDeviceComponent>,
              private locationService: LocationService,
              private vehicleService: VehicleService,
              private deviceService: DeviceService,
              private toastr: ToastrService,
              private errorHandler: ErrorHandlerService) {
  }

  ngOnInit() {
    this.getLocations();
    this.getVehicles();
    this.setStateValue();
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

  filterLocations() {
    const searchLocation = this.deviceForm.get('searchLocation')?.value;
    if (searchLocation.trim() === '') {
      this.filteredLocations = this.locations?.slice(0, 5);
    } else {
      this.filteredLocations = this.locations?.filter(location =>
        location.name!.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }
  }

  filterVehicles() {
    const searchVehicle = this.deviceForm.get('searchVehicle')?.value;
    if (searchVehicle.trim() === '') {
      this.filteredVehicles = this.vehicles?.slice(0, 5);
    } else {
      this.filteredVehicles = this.vehicles?.filter(location =>
        location.name!.toLowerCase().includes(searchVehicle.toLowerCase())
      );
    }
  }

  setLocationInput(device: Device) {
    this.deviceForm.patchValue({
      location: device.name
    });
    this.showLocations = false;
  }

  setVehicleInput(vehicle: Vehicle) {
    this.deviceForm.patchValue({
      vehicle: vehicle.name
    });
    this.showVehicles = false;
  }

  saveDevice() {
    if (this.deviceForm.valid) {
      this.isSubmitting = true;
      const deviceData = this.deviceForm.value;

      delete deviceData.searchLocation;
      delete deviceData.searchVehicle;

      const deviceToSave = {} as Device;
      deviceToSave.location = {} as Location;
      deviceToSave.vehicle = {} as Vehicle;
      deviceToSave.state = {} as State;
      deviceToSave.name = deviceData.name;
      deviceToSave.location.name = deviceData.location;
      deviceToSave.vehicle.name = deviceData.vehicle;
      deviceToSave.state.deviceState = deviceData.state;

      if (!deviceData.vehicle) {
        deviceToSave.vehicle = null;
      }
      if (!deviceData.location) {
        deviceToSave.location = null;
      }

      this.deviceService.addDevice(deviceToSave).subscribe(res => {
        if (this.hasError(res)) {
          this.errorHandler.setErrorMessage(res.errorMessage!)
          this.createdSuccessful.emit(false);
          this.isSubmitting = false;
        } else {
          this.toastr.success(`Gerät ${res.object.name} erfolgreich erstellt!`);
          this.createdSuccessful.emit(true);
          this.deviceForm.get('name')?.reset();
          this.getLocations();
          this.getVehicles();
          this.isSubmitting = false;
        }
      });
    }
  }

  hasError(model: ModelAndError): boolean {
    return !!(!model.object && model.errorMessage);
  }

  handleVehicleClick() {
    this.deviceForm.get('vehicle')?.setValidators(Validators.required);
    this.handleLocationInput();
    this.locationSelected = false;
    this.showVehicles = false;
    this.showLocations = false;
    this.setStateValue();
  }

  showVehiclesList() {
    this.showVehicles = !this.showVehicles;
    this.filteredVehicles = this.vehicles?.slice(0, 5);
  }

  private handleLocationInput() {
    this.deviceForm.get('location')?.clearValidators();
    this.deviceForm.get('location')?.setValue(null);
    this.deviceForm.get('location')?.updateValueAndValidity();
  }

  handleLocationClick() {
    this.deviceForm.get('location')?.setValidators(Validators.required);
    this.locationSelected = true;
    this.showLocations = false;
    this.showVehicles = false;
    this.setStateValue();
    this.handleVehicleInput();
  }

  showLocationsList() {
    this.showLocations = !this.showLocations;
    this.filteredLocations = this.locations?.slice(0, 5);
  }

  private handleVehicleInput() {
    this.deviceForm.get('vehicle')?.clearValidators();
    this.deviceForm.get('vehicle')?.setValue(null);
    this.deviceForm.get('vehicle')?.updateValueAndValidity();
  }

  public setStateValue() {
    if (this.locationSelected) {
      this.deviceForm.patchValue({
        state: DeviceState.STORAGE
      });
    }
    if (!this.locationSelected) {
      this.deviceForm.patchValue({
        state: DeviceState.ACTIVE
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  resetForm() {
    this.deviceForm.reset();
  }

}
