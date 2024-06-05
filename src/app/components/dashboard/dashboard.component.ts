import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DeviceService} from '../../services/device.service';
import {Device} from '../../models/Device';
import {MatDialog} from '@angular/material/dialog';
import {EditDialogComponent} from '../dialog/edit-dialog/edit-dialog.component';
import {AddDeviceComponent} from '../add-device/add-device.component';
import {ToastrService} from 'ngx-toastr';
import {DeleteDialogComponent} from '../dialog/delete-dialog/delete-dialog.component';
import {DeviceState} from '../../models/DeviceState';
import {DeleteMultipleDevicesDialog} from '../dialog/delete-multiple-devices-dialog/delete-multiple-devices-dialog';
import {LocationService} from '../../services/location.service';
import {Location} from '../../models/Location';
import {VehicleService} from '../../services/vehicle.service';
import {Vehicle} from '../../models/Vehicle';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput') searchInputField!: ElementRef;

  devices?: Device[] = [];
  filteredDevices?: Device[] = [];
  locations: Location[] = [];
  filteredLocations: Location[] = [];
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  formShowing?: boolean = false;
  deviceSearch?: '';
  devicesToDelete: Device[] = [];
  isChecked = false;
  currLocationOrVehicle = '';

  protected readonly DeviceState = DeviceState;
  activeState?: DeviceState;
  stateFilterEqualsActive: boolean = false;


  constructor(private deviceService: DeviceService,
              private dialog: MatDialog,
              private toastr: ToastrService,
              private locationService: LocationService,
              private vehicleService: VehicleService) {
  }

  ngOnInit() {
    this.getAllDevices();
    this.getAllLocations();
    this.getAllVehicles();
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

  getAllLocations() {
    this.locationService.getAllLocations().subscribe(res => {
      if (res) {
        this.locations = res;
        this.filteredLocations = this.locations;
      }
    });
  }

  getAllVehicles() {
    this.vehicleService.getAllVehicles().subscribe(res => {
      if (res) {
        this.vehicles = res;
        this.filteredVehicles = this.vehicles;
      }
    });
  }

  stateFilterChanged(value: DeviceState) {
    this.activeState = value;
    if (this.currLocationOrVehicle) {
      this.stateFilterEqualsActive = this.activeState === DeviceState.ACTIVE;
      this.filteredDevices = this.devices!.filter(device => {
        const stateMatches = device.state?.deviceState === this.activeState;
        const locationMatches = device.location?.name === this.currLocationOrVehicle;
        const vehicleMatches = device.vehicle?.name === this.currLocationOrVehicle;

        return stateMatches && (locationMatches || vehicleMatches);
      });
    } else {
      this.filterDevices();
    }
  }

  filterDevices() {
    const deviceSearchId = Number(this.deviceSearch!);
    const searchLower = this.deviceSearch?.toLowerCase() || '';

    if (!this.activeState) {
      this.filteredDevices = this.devices?.filter(device => {
        const matchesId = device.id === deviceSearchId;
        const matchesName = device.name?.toLowerCase().includes(searchLower);
        const matchesLocation = device.location?.name?.toLowerCase().includes(searchLower.toLowerCase());
        const matchesVehicle = device.vehicle?.name?.toLowerCase().includes(searchLower.toLowerCase());

        return matchesId || matchesName || matchesLocation || matchesVehicle;
      });
    } else {
      this.filteredDevices = this.devices?.filter(device => {
        return device.state?.deviceState === this.activeState;
      });
    }
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
    });
  }

  openEditModal(device: Device) {
    this.formShowing = true;
    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: '400px',
      height: 'auto',
      autoFocus: false,
      hasBackdrop: false,
      data: {
        device: device
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.formShowing = false;
    });
  }

  openDeleteModal(device: Device) {
    this.formShowing = true;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      hasBackdrop: false,
      autoFocus: false,
      data: {
        device: device
      }
    });
    dialogRef.componentInstance.delete!.subscribe(res => {
      if (res) {
        this.deviceService.delete(device).subscribe(res => {
          if (res === 'OK') {
            this.toastr.success(`Gerät ${device.name} erfolgreich gelöscht`);
            this.getAllDevices();
            dialogRef.close();
          }
        });
      } else {
        this.toastr.error(`Gerät ${device.name} könnte nicht gelöscht werden`);
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.formShowing = false;
    });
  }

  getDeviceState(device: Device): string {
    let state = 'UNBEKANNT';
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
    this.stateFilterEqualsActive = false;
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
      const newDevices = this.filteredDevices!.filter(device =>
        !this.devicesToDelete.some(selectedDevice => selectedDevice.id === device.id)
      );
      this.devicesToDelete.push(...newDevices);
    } else {
      const filteredDeviceIds = this.filteredDevices!.map(device => device.id);
      this.devicesToDelete = this.devicesToDelete.filter(device => !filteredDeviceIds.includes(device.id));
    }
  }

  isDeviceSelected(device: Device) {
    return this.devicesToDelete.some(selectedDevice => selectedDevice.id === device.id);
  }

  openDeleteMultipleDialog() {
    this.formShowing = true;
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
    dialogRef.afterClosed().subscribe(() => {
      this.formShowing = false;
      dialogRef.componentInstance.deleted!.unsubscribe();
    });
  }

  filterByVehicle(vehicleName: string) {
    this.currLocationOrVehicle = vehicleName;
    if (this.activeState) {
      this.filteredDevices = this.devices!.filter(device => {
        const vehicleOfDevice = device.vehicle?.name === vehicleName;
        const stateOfDevice = device.state?.deviceState === this.activeState;

        return vehicleOfDevice && stateOfDevice;
      });
    } else {
      this.filteredDevices = this.devices!.filter(device => {
        return device.vehicle?.name === vehicleName;
      });
    }
  }

  filterByLocation(locationName: string) {
    this.currLocationOrVehicle = locationName;
    if (this.activeState) {
      this.filteredDevices = this.devices!.filter(device => {
        const locationOfDevice = device.location?.name === locationName;
        const stateOfDevice = device.state?.deviceState === this.activeState;

        return locationOfDevice && stateOfDevice;
      });
    } else {
      this.filteredDevices = this.devices!.filter(device => {
        return device.location?.name === locationName;
      });
    }
  }

  showAllDevices(showAllDevices: boolean) {
    if (showAllDevices && !this.activeState) {
      this.filteredDevices = this.devices;
    } else {
      this.filteredDevices = this.devices!.filter(device => {
        return device.state?.deviceState === this.activeState;
      })
    }
  }
}
