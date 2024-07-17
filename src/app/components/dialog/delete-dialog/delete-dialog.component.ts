import {Component, EventEmitter, Inject, Output} from '@angular/core';
import {Device} from '../../../models/Device';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DeviceState} from '../../../models/DeviceState';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.scss'
})
export class DeleteDialogComponent {

  device?: Device;

  @Output()
  delete?: EventEmitter<boolean> = new EventEmitter<boolean>();
  showDetails: boolean = false;
  detailsText?: string = 'Details einblenden';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<DeleteDialogComponent>) {
    this.device = this.data.device;
  }

  deleteDevice() {
    this.delete?.emit(true);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  handleDetails() {
    this.showDetails =! this.showDetails;
    if (this.showDetails) {
      this.detailsText = 'Details ausblenden';
    } else {
      this.detailsText = 'Details einblenden';
    }
  }

  getVehicleName(): string {
    if (this.device?.vehicle == null) {
      return 'Kein Ort definiert';
    } else {
      return this.device.vehicle.name!;
    }
  }

  getLocationName(): string {
    if (this.device?.location == null) {
      return 'Kein Ort definiert';
    } else {
      return this.device.location.name!;
    }
  }

  getDeviceState(deviceState: DeviceState | undefined): string | undefined {
    let state: string | undefined;

    switch (deviceState) {
      case DeviceState.ACTIVE:
        state = 'AKTIV';
        break;
      case DeviceState.STORAGE:
        state = 'LAGER';
        break;
      case DeviceState.REESTABLISH:
        state = 'RETABLIEREN';
        break;
      default:
        state = undefined;
    }

    return state;
  }
}
