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
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.scss'
})
export class EditDialogComponent implements OnInit {

  @Output() updatedSuccessful = new EventEmitter<boolean>();

  device?: Device;
  selectedState?: string;
  editDeviceFormVehicle: FormGroup;
  editDeviceFormLocation: FormGroup;

  protected readonly DeviceState = DeviceState;
  locationIsVehicle?: boolean;
  vehicleFormDirty?: boolean;
  locationFormDirty?: boolean;
  selectedIndex?: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private matDialog: MatDialogRef<EditDialogComponent>,
              private deviceService: DeviceService,
              private errorHandler: ErrorHandlerService,
              private toastr: ToastrService) {
    this.device = this.data.device;
    this.editDeviceFormVehicle = new FormGroup({
      name: new FormControl(data.device.name, Validators.required),
      vehicle: new FormControl(this.device?.vehicle?.name, Validators.required),
      state: new FormControl(data.device.status?.deviceState, Validators.required)
    });
    this.editDeviceFormLocation = new FormGroup({
      name: new FormControl(data.device.name, Validators.required),
      location: new FormControl(this.device?.location?.name, Validators.required),
      state: new FormControl(data.device.status?.deviceState, Validators.required)
    });
  }

  ngOnInit() {
    if (this.device?.vehicle) {
      this.locationIsVehicle = true;
      this.selectedIndex = 0;
    } else {
      this.selectedIndex = 1
    }
    this.setStateInitValue();
  }

  private setStateInitValue() {
    if (this.device) {
      if (this.device?.vehicle) {
        const stateControl = this.editDeviceFormVehicle.get('state');
        if (stateControl) {
          stateControl.setValue(this.device.state?.deviceState || '');
        }
      } else {
        const stateControl = this.editDeviceFormLocation.get('state');
        if (stateControl) {
          stateControl.setValue(this.device!.state?.deviceState || '');
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
    let deviceLocation = (<HTMLInputElement>document.getElementById("location")).value;
    this.locationFormDirty = deviceLocation !== this.device?.location?.name;
  }

  checkDeviceVehicleChanged() {
    let deviceLocation = (<HTMLInputElement>document.getElementById("vehicle")).value;
    this.vehicleFormDirty = deviceLocation !== this.device?.vehicle?.name;
  }

  closeDialog() {
    this.matDialog.close();
  }

  updateDevice() {
    const deviceToSave = {} as Device;
    if (this.locationIsVehicle) {
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
        deviceToSave.state!.deviceState! = deviceData.state;

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
      this.locationIsVehicle = true;
    } else if ($event.index === 1) {
      this.locationIsVehicle = false;
    }
  }
}
