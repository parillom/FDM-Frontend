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
import {DeviceSearch} from '../../models/DeviceSearch';

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
  selectedDevices: Device[] = [];
  isChecked = false;
  locationName = '';
  vehicleName = '';
  deviceCriteria?: DeviceSearch;

  protected readonly DeviceState = DeviceState;
  currentState?: DeviceState;
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
    this.currentState = value;
    if (!this.vehicleName && !this.locationName) {
      this.deviceCriteria = {
        state: this.currentState,
      }
      console.log('onlyState')
      this.filterWithSpecifiedProperties(this.deviceCriteria);
    } else {
      if (this.vehicleName) {
        this.deviceCriteria = {
          state: this.currentState,
          vehicleName: this.vehicleName
        }
        console.log('stateAndVehicle')
        this.filterWithSpecifiedProperties(this.deviceCriteria);
      }
      if (this.locationName) {
        this.deviceCriteria = {
          state: this.currentState,
          locationName: this.locationName
        }
        console.log('stateAndLocation')
        this.filterWithSpecifiedProperties(this.deviceCriteria);
      }
    }

  }

  filterWithAllProperties() {
    const deviceSearchId = Number(this.deviceSearch!);
    const searchLower = this.deviceSearch?.toLowerCase() || '';

    this.filteredDevices = this.devices?.filter(device => {
      const matchesId = device.id === deviceSearchId;
      const matchesName = device.name?.toLowerCase().includes(searchLower);
      const matchesLocation = device.location?.name?.toLowerCase().includes(searchLower.toLowerCase());
      const matchesVehicle = device.vehicle?.name?.toLowerCase().includes(searchLower.toLowerCase());

      return matchesId || matchesName || matchesLocation || matchesVehicle;
    });
  }

  filterWithSpecifiedProperties(deviceCriteria: DeviceSearch | null) {
    if (deviceCriteria === null) {
      this.filteredDevices = this.devices;
    } else {
      if (deviceCriteria!.state && !(deviceCriteria!.vehicleName && deviceCriteria!.locationName)) {
        this.filteredDevices = this.devices!.filter(device => {
          return device.state?.deviceState === deviceCriteria!.state;
        });
      }
      if (deviceCriteria!.state && deviceCriteria!.vehicleName) {
        this.filteredDevices = this.devices!.filter(device => {
          const matchesState = device.state?.deviceState === deviceCriteria!.state;
          const matchesVehicleName = device.vehicle?.name === deviceCriteria!.vehicleName;

          return matchesState && matchesVehicleName;
        });
      }
      if (deviceCriteria!.state && deviceCriteria!.locationName) {
        this.filteredDevices = this.devices!.filter(device => {
          const matchesState = device.state?.deviceState === deviceCriteria!.state;
          const matchesLocationName = device.location?.name === deviceCriteria!.locationName;

          return matchesState && matchesLocationName;
        });
      }
      if (deviceCriteria!.vehicleName && !deviceCriteria?.state) {
        this.filteredDevices = this.devices!.filter(device => {
          return device.vehicle?.name === deviceCriteria?.vehicleName;
        });
      }
      if (deviceCriteria!.locationName && !deviceCriteria!.state) {
        this.filteredDevices = this.devices!.filter(device => {
          return device.location?.name === deviceCriteria?.locationName;
        });
      }
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
    dialogRef.componentInstance.updatedSuccessful.subscribe(res => {
      if (res) {
        this.getAllDevices();
      }
    })
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
    const index = this.selectedDevices.indexOf(device);
    if (index !== -1) {
      this.selectedDevices.splice(index, 1);
    } else {
      this.selectedDevices.push(device);
    }
    this.updateIsCheckedState();
  }

  updateIsCheckedState() {
    this.isChecked = this.devices?.length === this.selectedDevices.length;
  }

  addAllDevices() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      const newDevices = this.filteredDevices!.filter(device =>
        !this.selectedDevices.some(selectedDevice => selectedDevice.id === device.id)
      );
      this.selectedDevices.push(...newDevices);
    } else {
      const filteredDeviceIds = this.filteredDevices!.map(device => device.id);
      this.selectedDevices = this.selectedDevices.filter(device => !filteredDeviceIds.includes(device.id));
    }
  }

  isDeviceSelected(device: Device) {
    return this.selectedDevices.some(selectedDevice => selectedDevice.id === device.id);
  }

  openDeleteMultipleDialog() {
    this.formShowing = true;
    const dialogRef = this.dialog.open(DeleteMultipleDevicesDialog, {
      width: '400px',
      height: 'auto',
      hasBackdrop: false,
      autoFocus: false,
      data: {
        devicesToDelete: this.selectedDevices
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
        this.selectedDevices = [];
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

}
