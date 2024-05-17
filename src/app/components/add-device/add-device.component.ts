import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Device} from '../../models/Device';
import {Location} from '../../models/Location';
import {MatDialogRef} from '@angular/material/dialog';
import {LocationService} from '../../services/location.service';
import {Vehicle} from '../../models/Vehicle';
import {VehicleService} from '../../services/vehicle.service';
import {DeviceState} from '../../models/DeviceState';
import {DeviceService} from '../../services/device.service';
import {ToastrService} from 'ngx-toastr';

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
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.getLocations();
    this.getVehicles();
    this.onlyShowFirstFive();
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

  private onlyShowFirstFive() {
    this.filteredLocations = this.locations?.slice(0, 5);
  }

  filterLocations() {
    const searchLocation = this.deviceForm.get('searchLocation')?.value;
    this.filteredLocations = this.locations?.filter(location =>
      location.name!.toLowerCase().includes(searchLocation.toLowerCase())
    );
  }

  filterVehicles() {
    const searchVehicle = this.deviceForm.get('searchVehicle')?.value;
    this.filteredVehicles = this.vehicles?.filter(location =>
      location.name!.toLowerCase().includes(searchVehicle.toLowerCase())
    );
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
      const deviceData = this.deviceForm.value;

      delete deviceData.searchLocation;
      delete deviceData.searchVehicle;

      const deviceToSave = {} as Device;
      deviceToSave.location = {} as Location;
      deviceToSave.vehicle = {} as Vehicle;
      deviceToSave.name = deviceData.name;
      deviceToSave.location.name = deviceData.location;
      deviceToSave.vehicle.name = deviceData.vehicle;

      if (!deviceData.vehicle) {
        deviceToSave.vehicle = null;
      }
      if (!deviceData.location) {
        deviceToSave.location = null;
      }

      this.deviceService.addDevice(deviceToSave).subscribe(device => {
        if (device) {
          this.toastr.success(`Gerät ${device.name} erfolgreich erstellt!`);
          this.createdSuccessful.emit(true);
          this.getLocations();
          this.getVehicles();
        } else {
          this.toastr.error(`Gerät ${deviceToSave.name} konnte nicht erstellt werden!`);
          this.createdSuccessful.emit(false);
        }
      })
    }
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
    this.showVehicles =! this.showVehicles;
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
    this.showLocations =! this.showLocations;
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
