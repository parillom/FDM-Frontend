import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {VehicleService} from '../../../services/vehicle.service';
import {ActivatedRoute} from '@angular/router';
import {ErrorHandlerService} from '../../../services/error-handler.service';
import {Vehicle} from '../../../models/Vehicle';
import {Device} from '../../../models/Device';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatTabChangeEvent} from '@angular/material/tabs';

@Component({
  selector: 'app-vehicle-edit',
  templateUrl: './vehicle-edit.component.html',
  styleUrl: './vehicle-edit.component.scss'
})
export class VehicleEditComponent implements OnInit {

  uuid?: number;
  vehicle?: Vehicle;
  devices: Device[] = [];
  droppedDevices: Device[] = [];
  allocateDevices = true;
  selectedDevices: Device[] = [];
  isChecked: boolean = false;
  dropListIsChecked: boolean = false;
  filteredDevices: Device[] = [];
  filteredDevicesDropped: Device[] = [];
  deviceSearch: string = '';
  deviceSearchDropped: string = '';

  constructor(private vehicleService: VehicleService,
              private router: ActivatedRoute,
              private errorhandler: ErrorHandlerService) {
  }

  ngOnInit() {
    this.router.queryParams.subscribe(param => {
      this.uuid = param['id'];
    });
    this.getVehicle(this.uuid!);
  }

  getVehicle(uuId: number) {
    this.vehicleService.getVehicle(uuId).subscribe(res => {
      if (res) {
        if (this.errorhandler.hasError(res)) {
          this.errorhandler.setErrorMessage(res.errorMessage!);
        } else {
          this.vehicle = res.object;
          this.vehicleService.getDevicesFromVehicle(this.vehicle!).subscribe(res => {
            if (res) {
              if (this.errorhandler.hasError(res)) {
                this.errorhandler.setErrorMessage(res.errorMessage!);
              } else {
                this.devices = res.object;
                this.filteredDevices = this.devices;
              }
            }
          });
        }
      }
    });
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

  changeVehicleMode(event: MatTabChangeEvent) {
    if (event.index === 0) {
      this.allocateDevices = true;
    } else if (event.index === 1) {
      this.allocateDevices = false;
    }
  }

  isDeviceSelected(device: Device) {
    return this.selectedDevices.some(deviceInList => deviceInList.id === device.id);
  }

  selectAll() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      this.filteredDevices.forEach(device => {
        if (!this.selectedDevices.includes(device) && !this.droppedDevices.includes(device)) {
          this.selectedDevices.push(device);
        }
      });
    } else {
      this.selectedDevices.splice(0);
    }
  }

  selectAllDropList() {
    this.dropListIsChecked = !this.dropListIsChecked;
    if (this.dropListIsChecked) {
      this.droppedDevices.forEach(device => {
        if (!this.selectedDevices.includes(device) && !this.filteredDevices.includes(device)) {
          this.selectedDevices.push(device);
        }
      });
    } else {
      this.selectedDevices.splice(0);
    }
  }

  handleCheckboxClick(device: Device) {
    const index = this.selectedDevices.findIndex(selectedDevice => selectedDevice.id === device.id);
    if (index !== -1) {
      this.selectedDevices.splice(index, 1);
    } else {
      this.selectedDevices.push(device);
    }
    this.updateIsCheckedState();
  }

  updateIsCheckedState() {
    this.isChecked = this.filteredDevices?.length === this.selectedDevices.length!;
  }

  handleCheckboxClickDropped(device: Device) {
    let index = this.selectedDevices.findIndex(selectedDevice => selectedDevice.id === device.id);
    if (index !== -1) {
      this.selectedDevices.splice(index, 1);
    } else {
      this.selectedDevices.push(device);
    }
    this.updateIsCheckedStateDropped();
  }

  updateIsCheckedStateDropped() {
    this.dropListIsChecked = this.droppedDevices.length! === this.selectedDevices.length!;
  }

  moveDevices() {
    if (this.selectedDevices.every(device => this.droppedDevices.includes(device))) {
      this.filteredDevices.push(...this.selectedDevices);
      this.droppedDevices = this.droppedDevices?.filter(device => !this.filteredDevices.includes(device)) || [];
    } else {
      this.droppedDevices.push(...this.selectedDevices);
      this.filteredDevices = this.filteredDevices?.filter(device => !this.droppedDevices.includes(device)) || [];
    }
    this.selectedDevices = [];
    this.isChecked = false;
    this.dropListIsChecked = false;
  }


  filterWithAllProperties() {
    const searchLower = this.deviceSearch.toLowerCase() || '';

    this.filteredDevices = this.devices.filter(device =>
      !this.droppedDevices.some(droppedDevice => droppedDevice.id === device.id) &&
      device.name?.toLowerCase().includes(searchLower)
    );
  }
}
