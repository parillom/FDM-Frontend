import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {Device} from '../../../models/Device';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DeviceState} from '../../../models/DeviceState';
import {Location} from '../../../models/Location';
import {Vehicle} from '../../../models/Vehicle';
import {State} from '../../../models/State';
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
      if (!this.assignToVehicle) {
        const stateControl = this.editDeviceFormLocation.get('stateLocation');
        stateControl!.setValue(this.device!.state?.deviceState || '');
      } else {
        const stateControlVehicle = this.editDeviceFormVehicle.get('state');
        if (stateControlVehicle) {
          stateControlVehicle.setValue(DeviceState.ACTIVE);
        }
      }
    }
  }

  onStateChanged(state: DeviceState) {
    this.selectedState = state;
    const stateControlLocation = this.editDeviceFormLocation.get('state')?.value;
    this.locationFormDirty = this.device?.state?.deviceState !== stateControlLocation;
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
    if (this.assignToVehicle) {
      if (this.editDeviceFormVehicle.valid) {
        const deviceData = this.editDeviceFormVehicle.value;

        deviceToSave.location = {} as Location;
        deviceToSave.vehicle = {} as Vehicle;
        deviceToSave.state = {} as State;

        deviceToSave.id = this.device?.id;
        deviceToSave.name = deviceData.name;
        deviceToSave.vehicle.name = deviceData.vehicle;
        deviceToSave.location = null;
        deviceToSave.state!.deviceState! = deviceData.state;

        this.deviceService.updateDevice(deviceToSave, true).subscribe(res => {
            if (this.errorHandler.hasError(res)) {
              this.errorHandler.setErrorMessage(res.errorMessage!);
              this.updatedSuccessful.emit(false);
            } else {
              this.toastr.success(`Gerät ${res.object.name!} konnte erfolgreich bearbeitet werden`);
              this.updatedSuccessful.emit(true);
            }
          }
        );
      }
    } else {
      if (this.editDeviceFormLocation.valid) {
        const deviceData = this.editDeviceFormLocation.value;

        deviceToSave.location = {} as Location;
        deviceToSave.vehicle = {} as Vehicle;
        deviceToSave.state = {} as State;

        deviceToSave.id = this.device?.id;
        deviceToSave.name = deviceData.name;
        deviceToSave.vehicle = null;
        deviceToSave.location.name = deviceData.location;
        deviceToSave.state!.deviceState! = deviceData.stateLocation;

        this.deviceService.updateDevice(deviceToSave, false).subscribe(res => {
            if (this.errorHandler.hasError(res)) {
              this.errorHandler.setErrorMessage(res.errorMessage!);
              this.updatedSuccessful.emit(false);
            } else {
              this.toastr.success(`Gerät ${res.object.name!} konnte erfolgreich bearbeitet werden`);
              this.updatedSuccessful.emit(true);
            }
          }
        );
      }
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
