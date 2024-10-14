import {Component, EventEmitter, Inject, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DeviceService} from '../../../../services/device.service';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {Usecase} from '../../../../models/Usecase';
import {VehicleService} from '../../../../services/vehicle.service';
import {LocationService} from '../../../../services/location.service';
import {ResponseHandlerService} from '../../../../services/response-handler.service';
import {ModelAndError} from '../../../../models/ModelAndError';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-multiple-dialog.component.html',
  styleUrl: './delete-multiple-dialog.component.scss'
})
export class DeleteMultipleDialogComponent {

  objectsToDelete: any[] = [];
  objectToDeleteUuIds: string[] = [];
  useCase!: string;
  protected readonly Usecase = Usecase;

  @Output()
  deleted?: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  objectRemoved?: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<DeleteMultipleDialogComponent>,
              private deviceService: DeviceService,
              private matDialog: MatDialog,
              private vehicleService: VehicleService,
              private locationService: LocationService,
              private responseHandler: ResponseHandlerService) {
    this.objectsToDelete = this.data.objectsToDelete;
    this.useCase = this.data.useCase;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  removeObjectFromList(objectToRemove: any) {
    const index = this.objectsToDelete.findIndex(object => object.uuId === objectToRemove.uuId);
    this.objectsToDelete.splice(index, 1);
    this.objectRemoved!.emit(this.objectsToDelete);
  }

  openConfirmDialog() {
    const confirmDialog = this.matDialog.open(ConfirmDialogComponent, {
      autoFocus: false
    });
    confirmDialog.componentInstance.confirm.subscribe(res => {
      if (res && (this.useCase !== null && this.useCase !== undefined)) {
        if (this.useCase === Usecase.DEVICE) {
          this.objectToDeleteUuIds = this.objectsToDelete.map(device => device.uuId);
          if (this.objectToDeleteUuIds.length === this.objectsToDelete.length) {
            if (this.useCase === Usecase.DEVICE) {
              this.deviceService.delete(this.objectToDeleteUuIds).subscribe(res => {
                this.handleResponse(res);
              });
            }
          }
        } else if (this.useCase === Usecase.VEHICLE) {
          this.objectToDeleteUuIds = this.objectsToDelete.map(vehicle => vehicle.uuid);
          this.vehicleService.delete(this.objectToDeleteUuIds).subscribe(res => {
            this.handleResponse(res);
          });
        } else if (this.useCase === Usecase.LOCATION){
          this.objectToDeleteUuIds = this.objectsToDelete.map(location => location.uuid);
          this.locationService.delete(this.objectToDeleteUuIds).subscribe(res => {
            if (res && !this.responseHandler.hasError(res)) {
              this.deleted!.emit(true);
            } else {
              this.responseHandler.setErrorMessage(res.errorMessage!);
            }
          });
        }
      }
    });
  }

  private handleResponse(res: ModelAndError) {
    if (this.responseHandler.hasError(res)) {
      this.deleted!.emit(false);
      this.responseHandler.setErrorMessage(res.errorMessage!);
    } else {
      this.deleted!.emit(true);
    }
  }

  getUsecase(): string {
    let value = 'UNBEKANNT';
    if (this.useCase) {
      switch (this.useCase) {
        case Usecase.DEVICE:
          value = 'Geräte';
          break;
        case Usecase.LOCATION:
          value = 'Orte';
          break;
        case Usecase.VEHICLE:
          value = 'Fahrzeuge';
          break;
        default:
          value = 'UNBEKANNT';
      }
    }
    return value;
  }

}
