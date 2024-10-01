import {Component, Input, OnInit} from '@angular/core';
import {Device} from '../../../models/Device';
import {Vehicle} from '../../../models/Vehicle';
import {DeviceService} from '../../../services/device.service';
import {ErrorHandlerService} from '../../../services/error-handler.service';
import {VehicleService} from '../../../services/vehicle.service';
import {MoveDevicesRequest} from '../../../models/MoveDevicesRequest';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../common/dialog/confirm-dialog/confirm-dialog.component';
import {DeviceState} from '../../../models/DeviceState';

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
  deviceSearch = '';
  rendered = false;

  constructor(private deviceService: DeviceService,
              private vehicleService: VehicleService,
              private errorHandler: ErrorHandlerService,
              private matDialog: MatDialog) {
  }

  ngOnInit() {
    this.getAllDevices();
  }

  private getAllDevices() {
    this.rendered = false;
    this.deviceService.getAllDevices().subscribe(res => {
      if (res && !this.errorHandler.hasError(res)) {
        this.devices = res.object;
        this.devicesNotOnVehicle();
        this.rendered = true;
      } else {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  devicesNotOnVehicle() {
    this.filteredDevices = this.devices.filter(device => device.vehicle?.name !== this.vehicle?.name);
    this.devicesForSearch = this.filteredDevices;
  }

  getTooltipInfoText(): string {
    return 'Es werden nur Geräte angezeigt, die nicht bereits dem ausgewählten Fahrzeug zugewiesen sind.';
  }

  handleCheckboxClick(device: Device) {
    const index = this.selectedDevices.findIndex(deviceInList => deviceInList.id === device.id);
    if (index !== -1) {
      this.selectedDevices.splice(index, 1);
    } else {
      this.selectedDevices.push(device);
    }
  }

  filterWithAllProperties() {
    const name = this.deviceSearch.toLowerCase() || '';
    this.filteredDevices = this.devicesForSearch.filter(device => {
      return device.name!.includes(name);
    });
  }

  save() {
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
    const moveDevicesRequest: MoveDevicesRequest = {
      object: this.vehicle,
      objectList: this.selectedDevices,
      state: DeviceState.ACTIVE,
      isVehicle: true
    };

    console.log(moveDevicesRequest)

    this.vehicleService.moveDevices(moveDevicesRequest).subscribe(res => {
      if (res && !this.errorHandler.hasError(res)) {
        this.getAllDevices();
        this.selectedDevices.splice(0);
        this.errorHandler.setSuccessMessage(`Die Geräte wurden erfolgreich ${this.vehicle?.name} zugewiesen`);
      } else {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  isSelected(device: Device) {
    return this.selectedDevices.includes(device);
  }
}
