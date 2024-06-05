import {Component, Inject, OnInit} from '@angular/core';
import {Device} from '../../../models/Device';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DeviceState} from '../../../models/DeviceState';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.scss'
})
export class EditDialogComponent implements OnInit{

  device?: Device;
  selectedState?: string;
  formDirty?: boolean = false;
  editDeviceForm: FormGroup;

  protected readonly DeviceState = DeviceState;
  locationIsVehicle?: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private matDialog: MatDialogRef<EditDialogComponent>) {
    this.device = this.data.device;
    this.editDeviceForm = new FormGroup({
      name: new FormControl(data.device.name, Validators.required),
      location: new FormControl(this.device?.location?.name, Validators.required),
      vehicle: new FormControl(this.device?.vehicle?.name, Validators.required),
      state: new FormControl(data.device.status?.deviceState, Validators.required)
    });
  }

  ngOnInit() {
    if (this.device?.vehicle) {
      this.locationIsVehicle = true;
    }
    this.setStateInitValue();
  }

  private setStateInitValue() {
    if (this.device) {
      const stateControl = this.editDeviceForm.get('state');
      if (stateControl) {
        stateControl.setValue(this.device.state?.deviceState || '');
      }
    }
  }

  onStateChanged(state: DeviceState) {
    this.selectedState = state;
    this.formDirty = state !== this.device?.state?.deviceState;
  }

  checkDeviceName() {
    let deviceName = (<HTMLInputElement>document.getElementById("deviceName")).value;
    this.formDirty = deviceName !== this.device?.name;
  }

  checkDeviceLocationChanged() {
    let deviceLocation = (<HTMLInputElement>document.getElementById("location")).value;
    this.formDirty = deviceLocation !== this.device?.location?.name;
  }

  checkDeviceVehicleChanged() {
    let deviceLocation = (<HTMLInputElement>document.getElementById("vehicle")).value;
    this.formDirty = deviceLocation !== this.device?.vehicle?.name;
  }

  closeDialog() {
    this.matDialog.close();
  }

}
