import {Component, Input, OnInit} from '@angular/core';
import {Location} from '../../../models/Location';
import {Device} from '../../../models/Device';
import {DeviceService} from '../../../services/device.service';
import {ResponseHandlerService} from '../../../services/response-handler.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../common/dialog/confirm-dialog/confirm-dialog.component';
import {MoveDevicesRequest} from '../../../models/MoveDevicesRequest';
import {DeviceState} from '../../../models/DeviceState';
import {StorageType} from '../../../models/StorageType';
import {LocationService} from '../../../services/location.service';

@Component({
  selector: 'app-add-devices-to-location',
  templateUrl: './add-devices-to-location.component.html',
  styleUrl: './add-devices-to-location.component.scss'
})
export class AddDevicesToLocationComponent implements OnInit {

  @Input()
  location?: Location;

  devices: Device[] = [];
  devicesForSearch: Device[] = [];
  filteredDevices: Device[] = [];
  selectedDevices: Device[] = [];
  deviceSearch = '';
  rendered = false;
  deviceState: DeviceState;
  stateNotSelected = false;
  protected readonly DeviceState = DeviceState;

  constructor(private deviceService: DeviceService,
              private locationService: LocationService,
              private responseHandler: ResponseHandlerService,
              private matDialog: MatDialog) {
  }

  ngOnInit() {
    this.getAllDevices();
  }

  private getAllDevices() {
    this.rendered = false;
    this.deviceService.getAll().subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.devices = res.object;
        this.devicesNotOnLocation();
        this.rendered = true;
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage);
      }
    });
  }

  devicesNotOnLocation() {
    this.devicesForSearch = this.devices.filter(device => device.location?.name !== this.location?.name);
    this.filteredDevices = this.devicesForSearch;
  }

  getTooltipInfoText(): string {
    return 'Es werden nur Geräte angezeigt, die nicht bereits dem ausgewählten Fahrzeug zugewiesen sind.';
  }

  handleCheckboxClick(device: Device) {
    const index = this.selectedDevices.findIndex(deviceInList => deviceInList.uuId === device.uuId);
    if (index !== -1) {
      this.selectedDevices.splice(index, 1);
    } else {
      this.selectedDevices.push(device);
    }
  }

  filterWithAllProperties() {
    const name = this.deviceSearch.toUpperCase() || '';
    this.filteredDevices = this.devicesForSearch.filter(device => {
      return device.name!.includes(name);
    });
  }

  save() {
    if (this.deviceState === null || this.deviceState === undefined) {
      this.stateNotSelected = true;
      return;
    }
    if (this.selectedDevices.length > 0) {
      const modal = this.matDialog.open(ConfirmDialogComponent, {
        autoFocus: false
      });
      modal.componentInstance.confirm.subscribe(res => {
        if (res) {
          this.moveDevices();
        }
      });
    }
  }

  moveDevices() {
    const objectListIds = this.selectedDevices.map(device => device.uuId);
    const objectListIdsAsString: string[] = [];

    objectListIds.forEach(object => {
      objectListIdsAsString.push(object.toString());
    });

    const request: MoveDevicesRequest = {
      storageId: this.location.uuid,
      deviceList: objectListIdsAsString,
      state: this.deviceState,
      storageType: StorageType.LOCATION
    };

    this.locationService.moveDevices(request).subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.getAllDevices();
        this.selectedDevices.splice(0);
        this.responseHandler.setSuccessMessage(`Die Geräte wurden erfolgreich ${this.location?.name.toUpperCase()} zugewiesen`);
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  isSelected(device: Device) {
    return this.selectedDevices.includes(device);
  }

  checkIfStateSelected() {
    if (this.deviceState !== null && this.deviceState !== undefined) {
      this.stateNotSelected = false;
    }
  }
}
