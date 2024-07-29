import {Component, EventEmitter, Inject, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DeviceState} from '../../../../models/DeviceState';
import {Usecase} from '../../../../models/Usecase';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.scss'
})
export class DeleteDialogComponent {

  object?: any;
  useCase: Usecase;

  @Output()
  delete?: EventEmitter<boolean> = new EventEmitter<boolean>();
  showDetails: boolean = false;
  detailsText?: string = 'Details einblenden';
  protected readonly Usecase = Usecase;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialog: MatDialog,
              public dialogRef: MatDialogRef<DeleteDialogComponent>) {
    this.object = this.data.object;
    this.useCase = this.data.useCase;
  }

  openConfirmDialog() {
    const modal = this.dialog.open(ConfirmDialogComponent, {
      autoFocus: false
    });
    modal.componentInstance.confirm.subscribe(res => {
      if (res) {
        this.delete?.emit(true);
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  handleDetails() {
    this.showDetails =! this.showDetails;
  }

  getVehicleName(): string {
    if (this.object?.vehicle == null) {
      return 'Kein Fahrzeug definiert';
    } else {
      return this.object.vehicle.name!;
    }
  }

  getLocationName(): string {
    if (this.object?.location == null) {
      return 'Kein Ort definiert';
    } else {
      return this.object.location.name!;
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

  getObjectName() {
    if (this.useCase === Usecase.DEVICE) {
      return 'Gerät';
    } else if (this.useCase === Usecase.VEHICLE) {
      return 'Fahrzeug';
    } else {
      return 'Ort';
    }
  }
}
