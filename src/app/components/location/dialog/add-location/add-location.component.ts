import {Component, EventEmitter} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {ErrorHandlerService} from '../../../../services/error-handler.service';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {Location} from '../../../../models/Location';
import {LocationService} from '../../../../services/location.service';

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrl: './add-location.component.scss'
})
export class AddLocationComponent {
  addOneLocation: boolean = true;
  isSubmitting: boolean = false;
  created: EventEmitter<boolean> = new EventEmitter<boolean>();

  locationForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  constructor(public dialogRef: MatDialogRef<AddLocationComponent>,
              private locationService: LocationService,
              private errorHandler: ErrorHandlerService) {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeCreateFormat(event: MatTabChangeEvent) {
    if (event.index === 0) {
      this.addOneLocation = true;
    } else if (event.index === 1) {
      this.addOneLocation = false;
    }
  }

  createLocation() {
    if (this.locationForm.valid) {
      const form = this.locationForm.value;
      const location = new Location();
      location.name = form.name;

      this.isSubmitting = true;

      this.locationService.createLocation(location).subscribe((res) => {
        if (res) {
          if (this.errorHandler.hasError(res)) {
            this.errorHandler.setErrorMessage(res.errorMessage!);
            this.isSubmitting = false;
            this.created.emit(false);
          } else {
            this.errorHandler.setSuccessMessage(`Ort ${location.name} konnte erfolgreich erstellt werden`);
            this.isSubmitting = false;
            this.created.emit(true);
          }
        }
      });
    }
  }
}
