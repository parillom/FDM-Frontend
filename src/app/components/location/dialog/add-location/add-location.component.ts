import {Component, EventEmitter} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {ResponseHandlerService} from '../../../../services/response-handler.service';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {LocationService} from '../../../../services/location.service';
import {CreateStorage} from '../../../../models/CreateStorage';

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrl: './add-location.component.scss'
})
export class AddLocationComponent {
  addOneLocation: boolean = true;
  isSubmitting: boolean = false;
  dragDisabled = true;
  created: EventEmitter<boolean> = new EventEmitter<boolean>();

  locationForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  constructor(public dialogRef: MatDialogRef<AddLocationComponent>,
              private locationService: LocationService,
              private responseHandler: ResponseHandlerService) {
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
      this.isSubmitting = true;
      const form = this.locationForm.value;

      const request: CreateStorage = {
        name: form.name
      };

      this.locationService.create(request).subscribe((res) => {
        if (res) {
          if (this.responseHandler.hasError(res)) {
            this.responseHandler.setErrorMessage(res.errorMessage!);
            this.isSubmitting = false;
            this.created.emit(false);
          } else {
            this.responseHandler.setSuccessMessage(`Ort ${request.name} konnte erfolgreich erstellt werden`);
            this.isSubmitting = false;
            this.created.emit(true);
          }
        }
      });
    }
  }

  disableDrag() {
    this.dragDisabled = false;
  }

  enableDrag() {
    this.dragDisabled = true;
  }
}
