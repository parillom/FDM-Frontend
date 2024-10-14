import {Component, HostBinding, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {OverlayContainer} from '@angular/cdk/overlay';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DeleteType} from '../../../models/DeleteType';
import {DeviceService} from '../../../services/device.service';
import {LocationService} from '../../../services/location.service';
import {VehicleService} from '../../../services/vehicle.service';
import {ModelAndError} from '../../../models/ModelAndError';
import {ResponseHandlerService} from '../../../services/response-handler.service';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';
import {ObjectTypePipe} from '../../../services/pipe/object-type.pipe';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {

  switchTheme = new FormControl(false);
  @HostBinding('class') className = '';
  darkClass = 'theme-dark';
  lightClass = 'theme-light';
  deleteTypes: DeleteType[] = [];
  protected readonly DeleteType = DeleteType;
  objectTypePipe = new ObjectTypePipe();

  constructor(private overlay: OverlayContainer,
              private dialog: MatDialogRef<SettingsComponent>,
              private deviceService: DeviceService,
              private locationService: LocationService,
              private vehicleService: VehicleService,
              private responseHandler: ResponseHandlerService,
              private modal: MatDialog) {
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme') || this.lightClass;
    this.switchTheme.setValue(savedTheme === this.darkClass);

    this.switchTheme.valueChanges.subscribe((currentMode) => {
      const theme = currentMode ? this.darkClass : this.lightClass;
      localStorage.setItem('theme', theme);
      this.applyTheme(theme);
    });
  }

  applyTheme(theme: string) {
    document.body.classList.remove(this.darkClass, this.lightClass);
    document.body.classList.add(theme);
    this.overlay.getContainerElement().classList.remove(this.darkClass, this.lightClass);
    this.overlay.getContainerElement().classList.add(theme);
  }

  closeModal() {
    this.dialog.close();
    sessionStorage.removeItem('settingsOpen');
  }

  changeDeleteTypes(type: DeleteType) {
    if (!this.deleteTypes.includes(type)) {
      this.deleteTypes.push(type);
    } else {
      const index = this.deleteTypes.findIndex(t => t === type);
      if (index !== -1) {
        this.deleteTypes.splice(index, 1);
      }
    }
  }

  deleteAll() {
    if (this.deleteTypes.includes(DeleteType.DEVICE)) {
      this.deviceService.deleteAll().subscribe(res => {
        this.handleResponse(res, DeleteType.DEVICE);
      });
    }
    if (this.deleteTypes.includes(DeleteType.VEHICLE)) {
      this.vehicleService.deleteAll().subscribe(res => {
        this.handleResponse(res, DeleteType.VEHICLE);
      });
    }
    if (this.deleteTypes.includes(DeleteType.LOCATION)) {
      this.locationService.deleteAll().subscribe(res => {
        this.handleResponse(res, DeleteType.LOCATION);
      });
    }
  }

  private handleResponse(res: ModelAndError, type: DeleteType) {
    if (res && !this.responseHandler.hasError(res)) {
      this.deleteTypes = [];
      this.responseHandler.setSuccessMessage('Löschung erfolgreich ' + this.objectTypePipe.transform(type));
    } else {
      if (res.errorMessage.includes('ist leer')) {
        this.responseHandler.setWarningMessage(res.errorMessage);
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage);
      }
    }
  }

  openConfirmDialog() {
    const dialog = this.modal.open(ConfirmDialogComponent, {
      autoFocus: false
    });

    dialog.componentInstance.confirm.subscribe(confirm => {
      if (confirm) {
        this.deleteAll();
      }
    });
  }
}
