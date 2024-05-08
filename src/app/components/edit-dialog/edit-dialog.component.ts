import {Component, Inject, OnInit} from '@angular/core';
import {Device} from '../../models/Device';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';
import {DeviceState} from '../../models/DeviceState';

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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.device = this.data.device;
    this.editDeviceForm = new FormGroup({
      name: new FormControl(data.device.name),
      location: new FormControl(data.device.location?.name),
      state: new FormControl(data.device.status?.deviceState)
    });
  }

  ngOnInit() {
    this.setStateInitValue();
  }

  private setStateInitValue() {
    if (this.device) {
      switch (this.device.status?.deviceState) {
        case DeviceState.ACTIVE:
          this.selectedState = 'ACTIVE';
          break;
        case DeviceState.REESTABLISH:
          this.selectedState = 'REESTABLISH';
          break;
        case DeviceState.STORAGE:
          this.selectedState = 'STORAGE';
          break;
        default:
          this.selectedState = '';
          break;
      }
    }
  }

  onStateChanged(state: DeviceState) {
    this.formDirty = state !== this.device?.status?.deviceState;
  }

  checkDeviceName() {
    let deviceName = (<HTMLInputElement>document.getElementById("deviceName")).value;
    this.formDirty = deviceName !== this.device?.name;
  }
}
