import {Component, EventEmitter, Output} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {VehicleService} from '../../../../services/vehicle.service';
import {ResponseHandlerService} from '../../../../services/response-handler.service';
import {CreateStorage} from '../../../../models/CreateStorage';

@Component({
  selector: 'app-add-vehicle',
  templateUrl: './add-vehicle.component.html',
  styleUrl: './add-vehicle.component.scss'
})
export class AddVehicleComponent {
  addOneVehicle: boolean = true;
  isSubmitting: boolean = false;
  created: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() manyCreatedSuccessful = new EventEmitter<boolean>();
  createRequestList: CreateStorage[] = [];

  vehicleForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  constructor(public dialogRef: MatDialogRef<AddVehicleComponent>,
              private vehicleService: VehicleService,
              private responseHandler: ResponseHandlerService) {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeCreateFormat(event: MatTabChangeEvent) {
    if (event.index === 0) {
      this.addOneVehicle = true;
    } else if (event.index === 1) {
      this.addOneVehicle = false;
    }
  }

  createVehicle() {
    if (this.vehicleForm.valid) {
      const form = this.vehicleForm.value;
      this.isSubmitting = true;

      const request: CreateStorage = {
        name: form.name
      };

      this.createRequestList.push(request);

      this.vehicleService.create(this.createRequestList).subscribe((res) => {
        if (res) {
          if (this.responseHandler.hasError(res)) {
            this.responseHandler.setErrorMessage(res.errorMessage!);
            this.isSubmitting = false;
            this.created.emit(false);
          } else {
            const nameList = this.createRequestList.map(request => request.name).join(', ');
            this.responseHandler.setSuccessMessage(`Fahrzeuge ${nameList} konnten erfolgreich erstellt werden`);
            this.isSubmitting = false;
            this.created.emit(true);
          }
        }
      });
    }
  }

  emitCreatedSuccessfullyValue(value: boolean) {
    this.manyCreatedSuccessful.emit(value);
  }
}
