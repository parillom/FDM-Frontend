import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {Device} from '../../../models/Device';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DeviceState} from '../../../models/DeviceState';
import {Location} from '../../../models/Location';
import {Vehicle} from '../../../models/Vehicle';
import {DeviceService} from '../../../services/device.service';
import {ErrorHandlerService} from '../../../services/error-handler.service';
import {ToastrService} from 'ngx-toastr';
import {MatTabChangeEvent} from '@angular/material/tabs';

@Component({
  selector: 'app-edit-device-dialog',
  templateUrl: './edit-device-dialog.component.html',
  styleUrl: './edit-device-dialog.component.scss'
})
export class EditDeviceDialogComponent implements OnInit {
  @Output() updatedSuccessful = new EventEmitter<boolean>();

  device?: Device;
  selectedState?: string;
  editDeviceFormVehicle: FormGroup;
  editDeviceFormLocation: FormGroup;

  protected readonly DeviceState = DeviceState;
  assignToVehicle?: boolean;
  vehicleFormDirty?: boolean;
  locationFormDirty?: boolean;
  showVehicleSearch: boolean = false;
  showLocationSearch: boolean = false;
  selectedIndex?: number;
  locations?: Location[];
  vehicles?: Vehicle[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private matDialog: MatDialogRef<EditDeviceDialogComponent>,
              private deviceService: DeviceService,
              private errorHandler: ErrorHandlerService,
              private toastr: ToastrService) {
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
      location: new FormControl(this.device?.location?.name, Validators.required),
      stateLocation: new FormControl(null, Validators.required)
    });
  }

  ngOnInit() {
    if (this.device?.vehicle) {
      this.assignToVehicle = true;
      this.selectedIndex = 0;
    } else {
      this.selectedIndex = 1
    }
    this.setStateInitValue();
  }

  private setStateInitValue() {
    if (this.device) {
      const stateControl = this.editDeviceFormLocation.get('stateLocation');
      stateControl!.setValue(this.device!.state || '');
      const stateControlVehicle = this.editDeviceFormVehicle.get('state');
      if (stateControlVehicle) {
        stateControlVehicle.setValue(DeviceState.ACTIVE);
      }
    }
  }

  onStateChanged(state: DeviceState) {
    this.selectedState = state;
    const stateControlLocation = this.editDeviceFormLocation.get('state')?.value;
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

  updateDevice() {
    const deviceToSave = {} as Device;
    const formValid = this.assignToVehicle ? this.editDeviceFormVehicle.valid : this.editDeviceFormLocation.valid;

    if (formValid) {
      const deviceData = this.assignToVehicle ? this.editDeviceFormVehicle.value : this.editDeviceFormLocation.value;

      deviceToSave.id = this.device?.id;
      deviceToSave.name = deviceData.name;
      deviceToSave.state = this.assignToVehicle ? deviceData.state : deviceData.stateLocation;

      if (this.assignToVehicle) {
        deviceToSave.vehicle = {name: deviceData.vehicle } as Vehicle;
        deviceToSave.location = null;
      } else {
        deviceToSave.vehicle = null;
        deviceToSave.location = { name: deviceData.location } as Location;
      }

      this.deviceService.updateDevice(deviceToSave).subscribe(res => {
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
      this.assignToVehicle = true;
    } else if ($event.index === 1) {
      this.assignToVehicle = false;
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
}
