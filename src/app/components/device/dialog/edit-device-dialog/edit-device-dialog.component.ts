import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {Device} from '../../../../models/Device';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DeviceState} from '../../../../models/DeviceState';
import {Location} from '../../../../models/Location';
import {Vehicle} from '../../../../models/Vehicle';
import {DeviceService} from '../../../../services/device.service';
import {ErrorHandlerService} from '../../../../services/error-handler.service';
import {ToastrService} from 'ngx-toastr';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {UpdateDevice} from '../../../../models/UpdateDevice';
import {StorageType} from '../../../../models/StorageType';
import {VehicleService} from '../../../../services/vehicle.service';
import {LocationService} from '../../../../services/location.service';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-edit-device-dialog',
  templateUrl: './edit-device-dialog.component.html',
  styleUrl: './edit-device-dialog.component.scss'
})
export class EditDeviceDialogComponent implements OnInit {
  @Output() updatedSuccessful = new EventEmitter<boolean>();

  device: Device;
  selectedState: DeviceState;
  editDeviceFormVehicle: FormGroup;
  editDeviceFormLocation: FormGroup;

  protected readonly DeviceState = DeviceState;
  vehicleFormDirty?: boolean;
  locationFormDirty?: boolean;
  showVehicleSearch: boolean = false;
  showLocationSearch: boolean = false;
  selectedIndex?: number;
  locations: Location[] = [];
  vehicles: Vehicle[] = [];
  storageType: StorageType;
  protected readonly StorageType = StorageType;
  dragDisabled = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private matDialog: MatDialogRef<EditDeviceDialogComponent>,
              private deviceService: DeviceService,
              private errorHandler: ErrorHandlerService,
              private toastr: ToastrService,
              private vehicleService: VehicleService,
              private locationService: LocationService) {
    this.device = this.data.device;
    this.vehicles = this.data.vehicles;
    this.locations = this.data.locations;
    this.editDeviceFormVehicle = new FormGroup({
      name: new FormControl(data.device.name, Validators.required),
      vehicle: new FormControl(this.device?.vehicle?.name, Validators.required),
      state: new FormControl(null, Validators.required)
    });
    this.editDeviceFormLocation = new FormGroup({
      name: new FormControl(data.device.name, Validators.required),
      location: new FormControl(this.device.location?.name, Validators.required),
      stateLocation: new FormControl(null, Validators.required)
    });
  }

  ngOnInit() {
    if (this.device.vehicle) {
      this.storageType = StorageType.VEHICLE;
      this.selectedIndex = 0;
    } else {
      this.storageType = StorageType.LOCATION;
      this.selectedIndex = 1;
    }
    this.setStateInitValue();
  }

  private setStateInitValue() {
    if (this.device) {
      if (this.storageType === StorageType.LOCATION) {
        const stateControl = this.editDeviceFormLocation.get('stateLocation');
        stateControl!.setValue(this.device.state || '');
        this.selectedState = this.device.state;
        const stateControlVehicle = this.editDeviceFormVehicle.get('state');
        stateControlVehicle.setValue(DeviceState.ACTIVE);
      } else {
        const stateControlVehicle = this.editDeviceFormVehicle.get('state');
        stateControlVehicle.setValue(DeviceState.ACTIVE);
        this.selectedState = DeviceState.ACTIVE;
      }
    }
  }

  onStateChanged(state: DeviceState) {
    this.selectedState = state;
    const stateControlLocation = this.editDeviceFormLocation.get('stateLocation')?.value;
    this.locationFormDirty = this.device?.state !== stateControlLocation;
  }

  checkDeviceName(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const deviceName = inputElement.id === 'deviceName' ? inputElement.value : this.device?.name;
    const deviceNameLocation = inputElement.id === 'deviceNameLocation' ? inputElement.value : this.device?.name;
    this.vehicleFormDirty = deviceName !== this.device?.name;
    this.locationFormDirty = deviceNameLocation !== this.device?.name;
  }

  checkDeviceLocationChanged() {
    const deviceLocation = (<HTMLInputElement>document.getElementById("location")).value;
    this.locationFormDirty = deviceLocation !== this.device?.location?.name;
  }

  checkDeviceVehicleChanged() {
    const deviceLocation = (<HTMLInputElement>document.getElementById("vehicle")).value;
    this.vehicleFormDirty = deviceLocation !== this.device?.vehicle?.name;
  }

  closeDialog() {
    this.matDialog.close();
  }

  async updateDevice() {
    const formValid = this.storageType === StorageType.VEHICLE ? this.editDeviceFormVehicle.valid : this.editDeviceFormLocation.valid;
    let storageId;

    if (formValid) {
      const deviceData = this.storageType === StorageType.VEHICLE ? this.editDeviceFormVehicle.value : this.editDeviceFormLocation.value;
      let state: DeviceState;

      if (this.storageType === StorageType.VEHICLE) {
        state = DeviceState.ACTIVE;
        const res = await firstValueFrom(this.vehicleService.getVehicleByName(deviceData.vehicle));
        if (this.errorHandler.hasError(res)) {
          this.errorHandler.setErrorMessage(res.errorMessage);
          return;
        } else {
          storageId = res.object.uuid;
        }
      } else if (this.storageType === StorageType.LOCATION) {
        state = deviceData.stateLocation;
        const res = await firstValueFrom(this.locationService.getLocationByName(deviceData.location));
        if (this.errorHandler.hasError(res)) {
          this.errorHandler.setErrorMessage(res.errorMessage);
          return;
        } else {
          storageId = res.object.uuid;
        }
      }

      const request: UpdateDevice = {
        uuid: this.device.uuId,
        name: deviceData.name,
        state: state,
        storageType: this.storageType,
        storageId: storageId
      };

      this.deviceService.update(request).subscribe(res => {
        if (this.errorHandler.hasError(res)) {
          this.errorHandler.setErrorMessage(res.errorMessage!);
          this.updatedSuccessful.emit(false);
        } else {
          this.toastr.success(`Gerät ${res.object.name!} konnte erfolgreich bearbeitet werden`);
          this.updatedSuccessful.emit(true);
        }
      });
    }
  }

  changeUpdateFormat($event: MatTabChangeEvent) {
    if ($event.index === 0) {
      this.storageType = StorageType.VEHICLE;
    } else if ($event.index === 1) {
      this.storageType = StorageType.LOCATION;
    }
  }

  setVehicleInput(vehicle: Vehicle) {
    this.editDeviceFormVehicle.patchValue({
      vehicle: vehicle.name
    });
    this.showVehicleSearch = false;
    this.checkDeviceVehicleChanged();
  }

  setLocationInput(location: Location) {
    this.editDeviceFormLocation.patchValue({
      location: location.name
    });
    this.showLocationSearch = false;
    this.checkDeviceLocationChanged();
  }

  showVehiclesList() {
    this.showVehicleSearch = !this.showVehicleSearch;
    this.showLocationSearch = false;
  }

  showLocationsList() {
    this.showLocationSearch = !this.showLocationSearch;
    this.showVehicleSearch = false;
  }


  filteredVehicles() {
    return this.vehicles.filter(vehicle => vehicle.name !== this.device.vehicle.name);
  }

  filteredLocations() {
    return this.locations.filter(location => location.name !== this.device.location.name);
  }

  disableDrag() {
    this.dragDisabled = true;
  }

  enableDrag() {
    this.dragDisabled = false;
  }
}
