import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DeviceService} from '../../services/device.service';
import {Device} from '../../models/Device';
import {MatDialog} from '@angular/material/dialog';
import {EditDialogComponent} from '../edit-dialog/edit-dialog.component';
import {AddDeviceComponent} from '../add-device/add-device.component';
import {ToastrService} from 'ngx-toastr';
import {DeleteDialogComponent} from '../delete-dialog/delete-dialog.component';
import {DeviceState} from '../../models/DeviceState';
import {DeleteMultipleDevicesDialog} from '../delete-multiple-devices-dialog/delete-multiple-devices-dialog';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput') searchInputField!: ElementRef;

  devices?: Device[] = [];
  filteredDevices?: Device[] = [];
  formShowing?: boolean = false;
  deviceSearch?: '';
  devicesToDelete: Device[] = [];
  isChecked = false;

  constructor(private deviceService: DeviceService,
              private dialog: MatDialog,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.getAllDevices();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchInputField.nativeElement.click();
    });
  }

  getAllDevices() {
    return this.deviceService.getAllDevices().subscribe(res => {
      if (res.object) {
        this.devices = res.object;
        this.filteredDevices = res.object;
      }
    });
  }

  filterDevices() {
    const deviceSearchId = Number(this.deviceSearch!);
    this.filteredDevices = this.devices?.filter(device =>
      device.id === deviceSearchId ||
      device.name?.toLowerCase().includes(this.deviceSearch!.toLowerCase()) ||
      device.location?.name?.toLowerCase().includes(this.deviceSearch!.toLowerCase()) ||
      device.state?.deviceState?.toLowerCase().includes(this.deviceSearch!.toLowerCase())
    );
  }

  openCreateForm() {
    const addDeviceDialog = this.dialog.open(AddDeviceComponent, {
      width: '400px',
      height: 'auto',
      autoFocus: false,
      hasBackdrop: false,
    });
    addDeviceDialog.afterClosed().subscribe(() => {
      this.formShowing = false;
    });
    this.formShowing = true;

    addDeviceDialog.componentInstance.createdSuccessful.subscribe(value => {
      if (value) {
        this.getAllDevices();
      }
    })
  }

  openEditModal(device: Device) {
    this.dialog.open(EditDialogComponent, {
      width: '400px',
      height: 'auto',
      hasBackdrop: false,
      data: {
        device: device
      }
    });
  }

  openDeleteModal(device: Device) {
    const deleteDeviceDialog = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      hasBackdrop: false,
      autoFocus: false,
      data: {
        device: device
      }
    });

    deleteDeviceDialog.componentInstance.delete!.subscribe(res => {
      if (res) {
        this.deviceService.delete(device).subscribe(res => {
          if (res === 'OK') {
            this.toastr.success(`Gerät ${device.name} erfolgreich gelöscht`);
            this.getAllDevices();
            deleteDeviceDialog.close();
          }
        });
      } else {
        this.toastr.error(`Gerät ${device.name} könnte nicht gelöscht werden`);
      }
    });
  }

  getDeviceState(device: Device): string {
    let state = 'UNKNOWN';
    switch (device.state?.deviceState) {
      case DeviceState.ACTIVE: {
        state = 'AKTIV';
        break;
      }
      case DeviceState.STORAGE: {
        state = 'LAGER';
        break;
      }
      case DeviceState.REESTABLISH: {
        state = 'RETABLIEREN';
        break;
      }
    }
    return state;
  }

  refreshDevices() {
    this.getAllDevices();
  }

  getLocationText(device: Device) {
    let locationText: string
    if (!device.location) {
      locationText = 'nicht definiert';
    } else {
      locationText = device.location.name!;
    }
    return locationText;
  }

  getVehicleText(device: Device) {
    let vehicleText: string
    if (!device.vehicle) {
      vehicleText = 'nicht definiert';
    } else {
      vehicleText = device.vehicle.name!;
    }
    return vehicleText;
  }

  handleCheckboxClick(device: Device) {
      const index = this.devicesToDelete.indexOf(device);
      if (index !== -1) {
        this.devicesToDelete.splice(index, 1);
      } else {
        this.devicesToDelete.push(device);
      }
      this.updateIsCheckedState();
  }

  updateIsCheckedState() {
    this.isChecked = this.devices?.length === this.devicesToDelete.length;
  }

  addAllDevices() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      const newDevices = this.devices!.filter(device =>
        !this.devicesToDelete.some(selectedDevice => selectedDevice.id === device.id)
      );
      this.devicesToDelete.push(...newDevices);
    } else {
      this.devicesToDelete.splice(0);
    }
  }

  isDeviceSelected(device: Device) {
    return this.devicesToDelete.some(selectedDevice => selectedDevice.id === device.id);
  }

  openDeleteMultipleDialog() {
    const dialogRef = this.dialog.open(DeleteMultipleDevicesDialog, {
      width: '400px',
      height: 'auto',
      hasBackdrop: false,
      autoFocus: false,
      data: {
        devicesToDelete: this.devicesToDelete
      }
    });
    dialogRef.componentInstance.change!.subscribe((updatedDeviceList) => {
      if (updatedDeviceList.length !== this.devices!.length) {
        this.isChecked = false;
      }
    });
    dialogRef.componentInstance.deleted!.subscribe(deleted => {
      if (deleted) {
        this.getAllDevices();
        this.devicesToDelete = [];
        this.toastr.success('Geräte wurden erfolgreich gelöscht');
        dialogRef.close();
        if (this.isChecked) {
          this.isChecked = false;
        }
      }
    });
  }
}
