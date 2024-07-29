import {Component, ErrorHandler, EventEmitter, Inject, Output} from '@angular/core';
import {Device} from '../../../../models/Device';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DeviceService} from '../../../../services/device.service';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {Usecase} from '../../../../models/Usecase';
import {VehicleService} from '../../../../services/vehicle.service';
import {LocationService} from '../../../../services/location.service';
import {ErrorHandlerService} from '../../../../services/error-handler.service';
import {ModelAndError} from '../../../../models/ModelAndError';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-multiple-dialog.html',
  styleUrl: './delete-multiple-dialog.scss'
})
export class DeleteMultipleDialog {

  objectsToDelete: any[] = [];
  objectToDeleteIds: (number | undefined)[] = [];
  useCase!: string;
  protected readonly Usecase = Usecase;

  @Output()
  deleted?: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  change?: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<DeleteMultipleDialog>,
              private deviceService: DeviceService,
              private matDialog: MatDialog,
              private vehicleService: VehicleService,
              private locationService: LocationService,
              private errorHandler: ErrorHandlerService) {
    this.objectsToDelete = this.data.objectsToDelete;
    this.useCase = this.data.useCase;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  removeObjectFromList(object: any) {
    const index = this.objectsToDelete.findIndex(object => object.id === object.id);
    this.objectsToDelete.splice(index, 1);
    this.change!.emit(this.objectsToDelete);
  }

  openConfirmDialog() {
    const confirmDialog = this.matDialog.open(ConfirmDialogComponent, {
      autoFocus: false
    });
    confirmDialog.componentInstance.confirm.subscribe(res => {
      if (res && (this.useCase !== null && this.useCase !== undefined)) {
        if (this.useCase === Usecase.DEVICE) {
          this.objectToDeleteIds = this.objectsToDelete.map(device => device.id);
          if (this.objectToDeleteIds.length === this.objectsToDelete.length) {
            if (this.useCase === Usecase.DEVICE) {
              this.deviceService.deleteDevices(this.objectToDeleteIds).subscribe(res => {
                this.handleResponse(res);
              });
            }
          }
        } else if (this.useCase === Usecase.VEHICLE) {
          this.objectToDeleteIds = this.objectsToDelete.map(vehicle => vehicle.id);
          this.vehicleService.deleteVehicles(this.objectToDeleteIds).subscribe(res => {
            this.handleResponse(res);
          });
        } else {
          this.locationService.deleteLocations(this.objectToDeleteIds).subscribe(res => {
            if (res === 'OK') {
              this.deleted!.emit(true);
            }
          });
        }
      }
    });
  }

  private handleResponse(res: ModelAndError) {
    if (this.errorHandler.hasError(res)) {
      this.deleted!.emit(false);
      this.errorHandler.setErrorMessage(res.errorMessage!);
    } else {
      this.deleted!.emit(true);
    }
  }

  getUsecase(): string {
    let value = 'UNBEKANNT'
    if (this.useCase) {
      switch (this.useCase) {
        case Usecase.DEVICE:
          value = 'Geräte'
          break;
        case Usecase.LOCATION:
          value = 'Orte';
          break;
        case Usecase.VEHICLE:
          value = 'Fahrzeuge';
          break
        default:
          value = 'UNBEKANNT'
      }
    }
    return value;
  }

}
