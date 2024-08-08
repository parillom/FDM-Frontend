import {Component, EventEmitter, Output} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Vehicle} from '../../../models/Vehicle';
import {VehicleService} from '../../../services/vehicle.service';
import {ErrorHandlerService} from '../../../services/error-handler.service';

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

  vehicleForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  constructor(public dialogRef: MatDialogRef<AddVehicleComponent>,
              private vehicleService: VehicleService,
              private errorHandler: ErrorHandlerService) {
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
      const vehicle = new Vehicle();
      vehicle.name = form.name;

      this.isSubmitting = true;

      this.vehicleService.createVehicle(vehicle).subscribe((res) => {
        if (res) {
          if (this.errorHandler.hasError(res)) {
            this.errorHandler.setErrorMessage(res.errorMessage!);
            this.isSubmitting = false;
            this.created.emit(false);
          } else {
            this.errorHandler.setSuccessMessage(`Fahrzeug ${vehicle.name} konnte erfolgreich erstellt werden`);
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
