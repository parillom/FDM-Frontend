import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Location} from '../../../../models/Location';
import {MatDialogRef} from '@angular/material/dialog';
import {LocationService} from '../../../../services/location.service';
import {DeviceService} from '../../../../services/device.service';
import {ResponseHandlerService} from '../../../../services/response-handler.service';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {CreateDevice} from '../../../../models/CreateDevice';
import {StorageType} from '../../../../models/StorageType';
import {DeviceType} from '../../../../models/DeviceType';
import {DeviceNotice} from '../../../../models/DeviceNotice';

@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.component.html',
  styleUrl: './add-device.component.scss',
})
export class AddDeviceComponent implements OnInit {
  filteredLocations: Location[] = [];
  devicesToSave: CreateDevice[] = [];
  addOneDevice: boolean = true;
  isSubmitting: boolean = false;
  dragDisabled = false;
  createMultiple = true;
  locations: Location[] = [];
  type: string;
  types: DeviceType[] = Object.values(DeviceType);
  filteredTypes: DeviceType[] = [];

  notices: DeviceNotice[] = Object.values(DeviceNotice);
  filteredNotices: DeviceNotice[] = [];

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() createdSuccessful = new EventEmitter<boolean>();
  @Output() manyCreatedSuccessful = new EventEmitter<boolean>();

  deviceForm: FormGroup = new FormGroup({
    name: new FormControl(null, Validators.required),
    type: new FormControl(null, Validators.required),
    notice: new FormControl(null, Validators.required),
    location: new FormControl<string | null>(null, Validators.required),
    state: new FormControl('', Validators.required),
  });

  constructor(public dialogRef: MatDialogRef<AddDeviceComponent>,
              private locationService: LocationService,
              private deviceService: DeviceService,
              private responseHandler: ResponseHandlerService) {
  }

  ngOnInit() {
    this.getLocations();
    this.filteredTypes = this.types;
    this.filteredNotices = this.notices;
  }

  private getLocations() {
    this.locationService.getAll().subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.locations = res.object;
        this.filteredLocations = this.locations;
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  changeCreateFormat(event: MatTabChangeEvent) {
    if (event.index === 0) {
      this.addOneDevice = true;
    } else if (event.index === 1) {
      this.addOneDevice = false;
    }
  }

  saveDevice() {
    if (this.deviceForm.valid) {
      this.devicesToSave = [];

      const form = this.deviceForm.value;

      let location = {} as Location;

      //getting the current location
      this.locationService.getLocationByName(form.location).subscribe(res => {
        if (this.responseHandler.hasError(res)) {
          this.responseHandler.setErrorMessage(res.errorMessage);
          return;
        } else {
          location = res.object;
        }

        const device: CreateDevice = {
          name: form.name,
          type: form.type,
          notice: form.notice,
          storageId: location.uuid,
          state: form.state,
          storageType: StorageType.LOCATION
        };

        this.devicesToSave.push(device);

        this.performSaveCall(this.devicesToSave);
      });
    }
  }


  performSaveCall(devices: CreateDevice[]) {
    this.deviceService.create(devices).subscribe(res => {
      if (this.responseHandler.hasError(res)) {
        this.responseHandler.setErrorMessage(res.errorMessage);
        this.createdSuccessful.emit(false);
        this.isSubmitting = false;
      } else {
        this.responseHandler.setSuccessMessage(`Gerät ${res.object.name} erfolgreich erstellt!`);
        this.createdSuccessful.emit(true);
        this.clearNameInput();
        this.getLocations();
        this.isSubmitting = false;
        if (!this.createMultiple) {
          this.closeDialog();
        }
      }
    });
  }

  clearNameInput() {
    this.deviceForm.get('name')?.reset();
    this.deviceForm.get('name')?.clearValidators();
    this.deviceForm.get('name')?.updateValueAndValidity();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  resetForm() {
    this.deviceForm.reset();
  }

  emitCreatedSuccessfullyValue(value: boolean) {
    this.manyCreatedSuccessful.emit(value);
  }

  disableDrag() {
    this.dragDisabled = true;
  }

  enableDrag() {
    this.dragDisabled = false;
  }

  handleCreateMultipleAction() {
    this.createMultiple = !this.createMultiple;
  }

  filterTypes(text: any) {
    this.filteredTypes = this.types?.filter(type => type!.toLowerCase().includes(text.target.value.toLowerCase()));
  }

  filterNotices(text: any) {
    this.filteredNotices = this.notices?.filter(notice => notice!.toLowerCase().includes(text.target.value.toLowerCase()));
  }

  filterLocations(text: any) {
    this.filteredLocations = this.locations?.filter(location => location!.name.toLowerCase().includes(text.target.value.toLowerCase()));
  }
}
