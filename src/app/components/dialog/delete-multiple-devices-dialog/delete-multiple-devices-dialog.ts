import {Component, EventEmitter, Inject, Output} from '@angular/core';
import {Device} from '../../../models/Device';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DeviceService} from '../../../services/device.service';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-multiple-devices-dialog.html',
  styleUrl: './delete-multiple-devices-dialog.scss'
})
export class DeleteMultipleDevicesDialog {

  devicesToDelete: Device[] = [];
  devicesToDeleteIds: (number | undefined)[] = [];

  @Output()
  deleted?: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  change?: EventEmitter<Device[]> = new EventEmitter<Device[]>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<DeleteMultipleDevicesDialog>,
              private deviceService: DeviceService,
              private matDialog: MatDialog) {
    this.devicesToDelete = this.data.devicesToDelete;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  removeDevice(device: Device) {
    const index = this.devicesToDelete.findIndex(object => object.id === device.id);
    this.devicesToDelete.splice(index, 1);
    this.change!.emit(this.devicesToDelete);
  }

  openConfirmDialog() {
    const confirmDialog = this.matDialog.open(ConfirmDialogComponent, {
      autoFocus: false
    });
    confirmDialog.componentInstance.confirm.subscribe(res => {
      if (res) {
        this.devicesToDeleteIds = this.devicesToDelete.map(device => device.id);
        if (this.devicesToDeleteIds.length === this.devicesToDelete.length) {
          this.deviceService.deleteDevices(this.devicesToDeleteIds).subscribe(res => {
            if (res === 'OK') {
              this.deleted!.emit(true);
            }
          });
        }
      }
    });
  }

}
