import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DeviceService} from '../../../services/device.service';
import {Device} from '../../../models/Device';
import {MatDialog} from '@angular/material/dialog';
import {EditDeviceDialogComponent} from '../dialog/edit-device-dialog/edit-device-dialog.component';
import {AddDeviceComponent} from '../dialog/add-device/add-device.component';
import {DeleteDialogComponent} from '../../common/dialog/delete-dialog/delete-dialog.component';
import {DeviceState} from '../../../models/DeviceState';
import {
  DeleteMultipleDialogComponent
} from '../../common/dialog/delete-multiple-dialog/delete-multiple-dialog.component';
import {LocationService} from '../../../services/location.service';
import {Location} from '../../../models/Location';
import {VehicleService} from '../../../services/vehicle.service';
import {Vehicle} from '../../../models/Vehicle';
import {DeviceSearch} from '../../../models/DeviceSearch';
import {
  VehicleLocationAutocompletionDashboardComponent
} from '../vehicle-location-autocompletion-dashboard/vehicle-location-autocompletion-dashboard.component';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {Usecase} from '../../../models/Usecase';
import {ResponseHandlerService} from '../../../services/response-handler.service';
import {Router} from '@angular/router';
import {ExportService} from '../../../services/export.service';
import {UpdateType} from '../../../models/UpdateType';
import {DeviceType} from '../../../models/DeviceType';
import {DeviceNotice} from '../../../models/DeviceNotice';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInputField!: ElementRef;
  @ViewChild(VehicleLocationAutocompletionDashboardComponent) vehicleLocationAutoCompletion!: VehicleLocationAutocompletionDashboardComponent;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  devices: Device[] = [];
  filteredDevices: Device[] = [];
  locations: Location[] = [];
  filteredLocations: Location[] = [];
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  formShowing: boolean = false;
  deviceSearch = '';
  selectedDevices: Device[] = [];
  isChecked = false;
  locationName: string | undefined;
  vehicleName: string | undefined;
  deviceCriteria: DeviceSearch;
  vehiclesOrLocationsSelected: boolean = false;
  stateSelected: boolean = false;
  vehicleOrLocationSelectedValue: string;
  protected readonly DeviceState = DeviceState;
  currentState?: DeviceState;
  displayedColumns: string[] = ['Name', 'Type', 'Notice', 'Fahrzeug', 'Ort', 'Status', 'Aktionen'];
  dataSource!: MatTableDataSource<Device>;
  showSpinner: boolean = false;
  disableRowClick: boolean = false;
  toDate: Date;
  fromDate: Date;
  showDateError: boolean = false;
  updateType: UpdateType;
  type: DeviceType;
  notice: DeviceNotice;

  constructor(private deviceService: DeviceService,
              private dialog: MatDialog,
              private locationService: LocationService,
              private vehicleService: VehicleService,
              private responseHandler: ResponseHandlerService,
              private router: Router,
              private exportService: ExportService,
  ) {
    this.dataSource = new MatTableDataSource<Device>();
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<Device>();
    this.getAllDevices(true);
    this.getAllLocations();
    this.getAllVehicles();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchInputField.nativeElement.click();
    });
    this.dataSource!.paginator = this.paginator!;
  }

  getAllDevices(resetSelectedDevices: boolean) {
    this.showSpinner = true;
    return this.deviceService.getAll().subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.devices = res.object;
        this.filteredDevices = res.object;
        if (resetSelectedDevices) {
          this.selectedDevices.splice(0);
        }
        this.dataSource.data! = this.filteredDevices;
        this.stateSelected = false;
        this.vehiclesOrLocationsSelected = false;
        this.currentState = undefined;
        this.vehicleOrLocationSelectedValue = '';
        this.showSpinner = false;
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage);
      }
    });
  }

  getAllLocations() {
    this.locationService.getAll().subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.locations = res.object;
        this.filteredLocations = this.locations;
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  getAllVehicles() {
    this.vehicleService.getAll().subscribe(res => {
      if (this.responseHandler.hasError(res)) {
        this.responseHandler.setErrorMessage(res.errorMessage!);
      } else {
        this.vehicles = res.object;
        this.filteredVehicles = this.vehicles;
      }
    });
  }

  stateFilterChanged(value: DeviceState) {
    this.currentState = value;
    this.stateSelected = true;

    if (value === DeviceState.STORAGE || value === DeviceState.REESTABLISH) {
      this.vehicleName = undefined;
    }
    if (value === DeviceState.ACTIVE) {
      this.locationName = undefined;
    }

    this.deviceCriteria = {
      state: this.currentState,
      vehicleName: this.vehicleName,
      locationName: this.locationName,
    };

    this.filterWithSpecifiedProperties(this.deviceCriteria);
  }

  vehicleOrLocationSelected(value: any) {
    this.vehicleOrLocationSelectedValue = value;
    this.vehiclesOrLocationsSelected = true;
    if (value === "vehicle") {
      this.deviceCriteria = {
        vehicleName: value,
        locationName: null
      };
      this.filterOnlyVehiclesOrLocations(this.deviceCriteria);
    } else {
      this.deviceCriteria = {
        locationName: value,
        vehicleName: null
      };
      this.filterOnlyVehiclesOrLocations(this.deviceCriteria);
    }
  }

  filterOnlyVehiclesOrLocations(deviceCriteria: DeviceSearch) {
    if (!deviceCriteria.locationName && deviceCriteria.vehicleName && !deviceCriteria.state && !this.vehicleName) {
      this.dataSource.data = this.devices.filter(device => {
        return device.location === null && (device.vehicle !== null && device.vehicle !== undefined);
      });
    }
    if (deviceCriteria.locationName && !deviceCriteria.vehicleName && !deviceCriteria.state) {
      this.dataSource.data = this.devices!.filter(device => {
        return device.vehicle === null && (device.location !== null && device.location !== undefined);
      });
    }
  }

  filterWithAllProperties() {
    const deviceSearchId = this.deviceSearch ? this.deviceSearch : '';
    const searchLower = this.deviceSearch?.toLowerCase() || '';

    this.dataSource.data! = this.devices!.filter(device => {
      const matchesId = device.uuId!.toString().includes(deviceSearchId);
      const matchesName = device.name?.toLowerCase().includes(searchLower);

      return matchesId || matchesName;
    });
  }

  filterWithSpecifiedProperties(deviceCriteria: DeviceSearch) {
    this.filteredDevices = this.devices
      .filter(device => !deviceCriteria?.state || device.state === deviceCriteria.state)
      .filter(device => !deviceCriteria?.vehicleName || device.vehicle?.name === deviceCriteria.vehicleName)
      .filter(device => !deviceCriteria?.locationName || device.location?.name === deviceCriteria.locationName)
      .filter(device => !deviceCriteria?.type || device.type === deviceCriteria.type)
      .filter(device => !deviceCriteria?.notice || device.notice === deviceCriteria.notice);

    this.dataSource.data! = this.filteredDevices;
  }

  openCreateDeviceDialog() {
    const addDeviceDialog = this.dialog.open(AddDeviceComponent, {
      width: '400px',
      height: 'auto',
      autoFocus: false,
      hasBackdrop: false,
    });
    this.formShowing = true;

    addDeviceDialog.componentInstance.createdSuccessful.subscribe(value => {
      if (value) {
        this.getAllDevices(true);
        this.getAllVehicles();
        this.getAllLocations();
      }
    });
    addDeviceDialog.componentInstance.manyCreatedSuccessful.subscribe(value => {
      if (value) {
        this.getAllDevices(true);
        addDeviceDialog.close();
      }
    });
    addDeviceDialog.afterClosed().subscribe(() => {
      this.formShowing = false;
    });
  }

  openEditModal(device: Device) {
    this.disableRowClick = true;
    if (!this.formShowing) {
      const dialogRef = this.dialog.open(EditDeviceDialogComponent, {
        width: '400px',
        height: 'auto',
        autoFocus: false,
        hasBackdrop: false,
        data: {
          device: device,
          vehicles: this.vehicles,
          locations: this.locations
        }
      });
      this.formShowing = true;
      dialogRef.afterClosed().subscribe(() => {
        this.formShowing = false;
        this.disableRowClick = false;
      });
      dialogRef.componentInstance.updatedSuccessful.subscribe(res => {
        if (res) {
          this.getAllDevices(true);
          dialogRef.close();
        }
      });
    }
  }

  openDeleteModal(device: Device) {
    this.disableRowClick = true;
    if (!this.formShowing) {
      const dialogRef = this.dialog.open(DeleteDialogComponent, {
        width: '400px',
        height: 'auto',
        hasBackdrop: false,
        autoFocus: false,
        data: {
          object: device,
          useCase: Usecase.DEVICE
        }
      });
      this.formShowing = true;
      dialogRef.componentInstance.delete!.subscribe(res => {
        if (res) {
          const objectsToDelete: string[] = [];
          objectsToDelete.push(device.uuId);

          this.deviceService.delete(objectsToDelete).subscribe(res => {
            if (this.responseHandler.hasError(res)) {
              this.responseHandler.setErrorMessage(res.errorMessage!);
              dialogRef.close();
            } else {
              this.responseHandler.setSuccessMessage(`Gerät ${device.name} konnte gelöscht werden`);
              this.getAllDevices(true);
              dialogRef.close();
            }
          });
        }
      });
      dialogRef.afterClosed().subscribe(() => {
        this.formShowing = false;
        this.disableRowClick = false;
      });
    }
  }

  refreshDevices() {
    this.getAllDevices(true);
    this.vehicleOrLocationSelectedValue = '';
    this.vehiclesOrLocationsSelected = false;
    if (this.vehicleLocationAutoCompletion) {
      this.vehicleLocationAutoCompletion.resetFields();
    }
    if (this.showDateError) {
      this.showDateError = false;
    }
    this.isChecked = false;
    this.resetFilters();
  }

  getLocationText(device: Device) {
    let locationText: string;
    if (!device.location) {
      locationText = 'nicht definiert';
    } else {
      locationText = device.location.name!;
    }
    return locationText;
  }

  getVehicleText(device: Device) {
    let vehicleText: string;
    if (!device.vehicle) {
      vehicleText = 'nicht definiert';
    } else {
      vehicleText = device.vehicle.name!;
    }
    return vehicleText;
  }

  handleCheckboxClick(device: Device, event: MouseEvent) {
    event.stopPropagation();
    const index = this.selectedDevices.indexOf(device);
    if (index !== -1) {
      this.selectedDevices.splice(index, 1);
    } else {
      this.selectedDevices.push(device);
    }
    this.updateIsCheckedState();
  }

  handleRowClick(device: Device) {
    if (!this.disableRowClick) {
      if (this.devices!.length > 1) {
        const index = this.selectedDevices.indexOf(device);
        if (index !== -1) {
          this.selectedDevices.splice(index, 1);
        } else {
          this.selectedDevices.push(device);
        }
        this.updateIsCheckedState();
      }
    }
  }

  updateIsCheckedState() {
    this.isChecked = this.devices?.length === this.selectedDevices.length || this.selectedDevices.length === this.filteredDevices!.length;
  }

  addAllDevices() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      //Nach allem filtern
      if (!this.currentState && !this.vehicleName && !this.locationName) {
        this.devices!.forEach(device => {
          if (!this.selectedDevices.includes(device)) {
            this.selectedDevices.push(device);
          }
        });
      } else if (this.currentState !== null && this.currentState !== undefined) {
        //nur nach Status filtern
        if (!this.vehicleName && !this.locationName) {
          const filteredDevices = this.filteredDevices!.filter(device =>
            device.state === this.currentState
          );
          filteredDevices.forEach(device => {
            if (!this.selectedDevices.includes(device)) {
              this.selectedDevices.push(device);
            }
          });
        } else {
          //nach Status und Fahrzeug filtern
          if (this.vehicleName) {
            const filteredDevices = this.filteredDevices!.filter(device => device.vehicle?.name === this.vehicleName
              && device.state === this.currentState);
            filteredDevices.forEach(device => {
              if (!this.selectedDevices.includes(device)) {
                this.selectedDevices.push(device);
              }
            });
          } else {
            //nach Status und Ort filtern
            const filteredDevices = this.filteredDevices!.filter(device => device.location?.name === this.locationName
              && device.state === this.currentState);
            filteredDevices.forEach(device => {
              if (!this.selectedDevices.includes(device)) {
                this.selectedDevices.push(device);
              }
            });
          }
        }
      } else {
        if (this.vehicleName || this.locationName) {
          //Nur nach Fahrzeug filtern
          if (this.vehicleName) {
            const filteredDevices = this.filteredDevices!.filter(device => device.vehicle?.name === this.vehicleName);
            filteredDevices.forEach(device => {
              if (!this.selectedDevices.includes(device)) {
                this.selectedDevices.push(device);
              }
            });
          } else {
            //Nur nach Ort filtern
            const filteredDevices = this.filteredDevices!.filter(device => device.location?.name === this.locationName);
            filteredDevices.forEach(device => {
              if (!this.selectedDevices.includes(device)) {
                this.selectedDevices.push(device);
              }
            });
          }
        }
      }
    } else {
      const filteredDeviceIds = this.filteredDevices!.map(device => device.uuId);
      this.selectedDevices = this.selectedDevices.filter(device => !filteredDeviceIds.includes(device.uuId));
    }
  }

  isDeviceSelected(device: Device) {
    return this.selectedDevices.some(selectedDevice => selectedDevice.uuId === device.uuId);
  }

  openDeleteMultipleDialog() {
    this.formShowing = true;
    const dialogRef = this.dialog.open(DeleteMultipleDialogComponent, {
      width: '400px',
      height: 'auto',
      hasBackdrop: false,
      autoFocus: false,
      data: {
        objectsToDelete: this.selectedDevices,
        useCase: Usecase.DEVICE
      }
    });
    dialogRef.componentInstance.objectRemoved!.subscribe((updatedDeviceList) => {
      if (updatedDeviceList.length !== this.devices!.length) {
        this.isChecked = false;
      }
    });
    dialogRef.componentInstance.deleted!.subscribe(deleted => {
      if (deleted) {
        this.getAllDevices(true);
        this.selectedDevices = [];
        this.responseHandler.setSuccessMessage('Geräte konnten erfolgreich gelöscht werden');
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

  resetStatus() {
    this.currentState = undefined;
    this.stateSelected = false;
    this.vehiclesOrLocationsSelected = false;
    this.vehicleOrLocationSelectedValue = '';
    this.isChecked = false;

    this.deviceCriteria = {
      locationName: this.locationName,
      vehicleName: this.vehicleName,
      state: this.currentState
    };

    this.filterWithSpecifiedProperties(this.deviceCriteria);
  }

  export(type: string) {
    if (type === 'EXCEL') {
      if (this.selectedDevices.length > 0) {
        this.exportService.exportExcel(this.selectedDevices);
        this.selectedDevices = [];
        this.isChecked = false;
      } else {
        this.exportService.exportExcel(this.dataSource.data);
      }
    } else {
      if (this.selectedDevices.length > 0) {
        this.exportService.exportPfd(this.selectedDevices);
        this.selectedDevices = [];
        this.isChecked = false;
      } else {
        this.exportService.exportPfd(this.dataSource.data);
      }
      window.location.reload();
    }
  }

  setNameOfVehicleOrLocation(request: DeviceSearch) {
    if (request) {
      if (request.vehicleName && request.vehicleName.trim() !== '') {
        this.vehicleName = request.vehicleName;
        this.locationName = undefined;
      } else if (request.locationName && request.locationName.trim() !== '') {
        this.locationName = request.locationName;
        this.vehicleName = undefined;
      } else {
        this.locationName = undefined;
        this.vehicleName = undefined;
      }
      this.filterWithSpecifiedProperties(request);
    }
  }

  resetFilters() {
    this.fromDate = undefined;
    this.toDate = undefined;
    this.locationName = undefined;
    this.vehicleName = undefined;
    this.currentState = undefined;
    this.updateType = undefined;
  }

  navigateToWorkflow(element: Device) {
    void this.router.navigate([`fdm/dashboard/device/workflow`], {queryParams: {uuId: element.uuId}});
  }

  setNotice(request: DeviceSearch) {
    if (request.notice && request.notice.trim() !== '') {
      this.notice = request.notice;
      this.filterWithSpecifiedProperties(request);
    } else {
      this.notice = undefined;
      this.deviceCriteria = {
        vehicleName: this.vehicleName,
        locationName: this.locationName,
        state: this.currentState,
        type: this.type,
        notice: this.notice
      };
      this.filterWithSpecifiedProperties(this.deviceCriteria);
    }
  }

  setType(request: DeviceSearch) {
    if (request.type && request.type.trim() !== '') {
      this.type = request.type;
      this.filterWithSpecifiedProperties(request);
    } else {
      this.type = undefined;
      this.deviceCriteria = {
        vehicleName: this.vehicleName,
        locationName: this.locationName,
        state: this.currentState,
        type: this.type,
        notice: this.notice
      };
      this.filterWithSpecifiedProperties(this.deviceCriteria);
    }
  }
}
