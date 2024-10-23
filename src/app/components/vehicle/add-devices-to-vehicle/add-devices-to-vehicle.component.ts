import {Component, Input, OnInit} from '@angular/core';
import {Device} from '../../../models/Device';
import {Vehicle} from '../../../models/Vehicle';
import {DeviceService} from '../../../services/device.service';
import {ResponseHandlerService} from '../../../services/response-handler.service';
import {VehicleService} from '../../../services/vehicle.service';
import {MoveDevicesRequest} from '../../../models/MoveDevicesRequest';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../common/dialog/confirm-dialog/confirm-dialog.component';
import {DeviceState} from '../../../models/DeviceState';
import {StorageType} from '../../../models/StorageType';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-add-devices-to-vehicle',
  templateUrl: './add-devices-to-vehicle.component.html',
  styleUrl: './add-devices-to-vehicle.component.scss'
})
export class AddDevicesToVehicleComponent implements OnInit {
  @Input()
  vehicle?: Vehicle;

  devices: Device[] = [];
  devicesForSearch: Device[] = [];
  filteredDevices: Device[] = [];
  selectedDevices: Device[] = [];
  droppedDevices: Device[] = [];
  deviceSearch = '';
  rendered = false;

  protected readonly DeviceState = DeviceState;

  constructor(private deviceService: DeviceService,
              private vehicleService: VehicleService,
              private responseHandler: ResponseHandlerService,
              private matDialog: MatDialog) {
  }

  ngOnInit() {
    this.getAllDevices();
  }

  private getAllDevices() {
    this.rendered = false;
    this.deviceService.getAssignable().subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.devices = res.object;
        this.filterDevicesFromVehicle();
        this.rendered = true;
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage);
      }
    });
  }

  filterDevicesFromVehicle() {
    this.devicesForSearch = this.devices.filter(device => device.vehicle?.name !== this.vehicle?.name);
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
    if (this.droppedDevices.length > 0) {
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
    const objectListIds = this.droppedDevices.map(device => device.uuId);
    const objectListIdsAsString: string[] = [];

    objectListIds.forEach(object => {
      objectListIdsAsString.push(object.toString());
    });

    const request: MoveDevicesRequest = {
      storageId: this.vehicle.uuid,
      deviceList: objectListIdsAsString,
      state: DeviceState.ACTIVE,
      storageType: StorageType.VEHICLE
    };

    this.vehicleService.moveDevices(request).subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.getAllDevices();
        this.droppedDevices.splice(0);
        this.responseHandler.setSuccessMessage(`Die Geräte wurden erfolgreich ${this.vehicle?.name} zugewiesen`);
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  isSelected(device: Device) {
    return this.selectedDevices.includes(device);
  }

  isDeviceSelected(device: Device) {
    return this.selectedDevices.includes(device);
  }

  drop(event: CdkDragDrop<Device[], any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data!, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data!,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  handleCheckboxClickDropped(device: Device) {
    const index = this.selectedDevices.findIndex(selectedDevice => selectedDevice.uuId === device.uuId);
    if (index !== -1) {
      this.selectedDevices.splice(index, 1);
    } else {
      this.selectedDevices.push(device);
    }
  }
}
