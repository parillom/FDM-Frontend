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
import {ErrorHandlerService} from '../../../services/error-handler.service';
import {Router} from '@angular/router';
import {ExportService} from '../../../services/export.service';
import {ScreenSizeService} from '../../../services/screen-size.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInputField!: ElementRef;
  @ViewChild(VehicleLocationAutocompletionDashboardComponent) vehicleLocationAutoCompletion!: VehicleLocationAutocompletionDashboardComponent;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

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
  locationName: string | null | undefined = '';
  vehicleName: string | null | undefined = '';
  deviceCriteria?: DeviceSearch;
  selectedState?: string;
  vehiclesOrLocationsSelected: boolean = false;
  stateSelected: boolean = false;
  vehicleOrLocationSelectedValue: string;
  protected readonly DeviceState = DeviceState;
  currentState?: DeviceState;
  displayedColumns: string[] = ['Geräte-ID', 'Name', 'Ort', 'Fahrzeug', 'Status', 'Aktionen'];
  dataSource!: MatTableDataSource<Device>;
  showSpinner: boolean = false;
  disableRowClick: boolean = false;
  openExportMenu = false;

  columnWidths = {
    'Geräte-ID': '15%'
  };

  constructor(private deviceService: DeviceService,
              private dialog: MatDialog,
              private locationService: LocationService,
              private vehicleService: VehicleService,
              private errorHandler: ErrorHandlerService,
              private router: Router,
              private exportService: ExportService,
              private screenSize: ScreenSizeService
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
      if (res && !this.errorHandler.hasError(res)) {
        this.devices = res.object;
        this.filteredDevices = res.object;
        if (resetSelectedDevices) {
          this.selectedDevices.splice(0);
        }
        this.dataSource.data! = this.filteredDevices!;
        this.stateSelected = false;
        this.vehiclesOrLocationsSelected = false;
        this.selectedState = '';
        this.vehicleOrLocationSelectedValue = '';
        this.showSpinner = false;
      } else {
        this.errorHandler.setErrorMessage(res.errorMessage);
      }
    });
  }

  getAllLocations() {
    this.locationService.getAll().subscribe(res => {
      if (res && !this.errorHandler.hasError(res)) {
        this.locations = res.object;
        this.filteredLocations = this.locations;
      } else {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  getAllVehicles() {
    this.vehicleService.getAll().subscribe(res => {
      if (this.errorHandler.hasError(res)) {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      } else {
        this.vehicles = res.object;
        this.filteredVehicles = this.vehicles;
      }
    });
  }

  stateFilterChanged(value: DeviceState) {
    this.currentState = value;
    this.stateSelected = true;
    if (!this.vehicleName && !this.locationName) {
      this.deviceCriteria = {
        state: this.currentState,
      };
      this.filterWithSpecifiedProperties(this.deviceCriteria);
    } else {
      if (this.vehicleName) {
        this.deviceCriteria = {
          state: this.currentState,
          vehicleName: this.vehicleName
        };
        this.filterWithSpecifiedProperties(this.deviceCriteria);
      }
      if (this.locationName) {
        this.deviceCriteria = {
          state: this.currentState,
          locationName: this.locationName
        };
        this.filterWithSpecifiedProperties(this.deviceCriteria);
      }
    }
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
      this.dataSource.data = this.devices!.filter(device => {
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

  filterWithSpecifiedProperties(deviceCriteria: DeviceSearch | null) {
    this.isChecked = false;
    this.vehicleName = deviceCriteria?.vehicleName;
    this.locationName = deviceCriteria?.locationName;
    if (deviceCriteria === null) {
      this.dataSource.data = this.devices!;
    } else {
      if (deviceCriteria!.state && !(deviceCriteria!.vehicleName && deviceCriteria!.locationName)) {
        this.dataSource.data = this.devices!.filter(device => {
          return device.state === deviceCriteria.state;
        });
      }
      if (deviceCriteria!.state && deviceCriteria!.vehicleName) {
        this.dataSource.data = this.devices!.filter(device => {
          const matchesState = device.state === deviceCriteria.state;
          const matchesVehicleName = device.vehicle?.name === deviceCriteria!.vehicleName;

          return matchesState && matchesVehicleName;
        });
      }
      if (deviceCriteria!.state && deviceCriteria!.locationName) {
        this.dataSource.data = this.devices.filter(device => {
          const matchesState = device.state === deviceCriteria!.state;
          const matchesLocationName = device?.location?.name === deviceCriteria?.locationName;

          return matchesState && matchesLocationName;
        });
      }
      if (deviceCriteria!.vehicleName && !deviceCriteria?.state) {
        this.isChecked = false;
        this.dataSource.data = this.devices!.filter(device => {
          return device.vehicle?.name === deviceCriteria?.vehicleName;
        });
      }
      if (deviceCriteria!.locationName && !deviceCriteria!.state) {
        this.isChecked = false;
        this.dataSource.data = this.devices!.filter(device => {
          return device.location?.name === deviceCriteria?.locationName;
        });
      }
    }
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
            if (this.errorHandler.hasError(res)) {
              this.errorHandler.setErrorMessage(res.errorMessage!);
              dialogRef.close();
            } else {
              this.errorHandler.setSuccessMessage(`Gerät ${device.name} konnte gelöscht werden`);
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
    this.handleFocusAndResetState();
    this.isChecked = false;
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
        this.errorHandler.setSuccessMessage('Geräte konnten erfolgreich gelöscht werden');
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

  handleFocusAndResetState() {
    this.selectedState = '';
    this.stateSelected = false;
    this.vehicleOrLocationSelectedValue = '';
    this.vehiclesOrLocationsSelected = false;
    if (this.vehicleLocationAutoCompletion) {
      this.vehicleLocationAutoCompletion.resetFields();
    }
  }

  resetStatus() {
    this.selectedState = '';
    this.stateSelected = false;
    this.vehiclesOrLocationsSelected = false;
    this.vehicleOrLocationSelectedValue = '';
    this.isChecked = false;
    this.currentState = undefined;
    if (!this.vehicleName && !this.locationName) {
      this.getAllDevices(false);
    } else if (this.vehicleName) {
      this.deviceCriteria = {
        vehicleName: this.vehicleName
      };
      this.filterWithSpecifiedProperties(this.deviceCriteria);
    } else if (this.locationName) {
      this.deviceCriteria = {
        locationName: this.locationName
      };
      this.filterWithSpecifiedProperties(this.deviceCriteria);
    }
  }

  openExportOption() {
    this.openExportMenu = !this.openExportMenu;
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
      this.openExportMenu = false;
    } else {
      if (this.selectedDevices.length > 0) {
        this.exportService.exportPfd(this.selectedDevices);
        this.selectedDevices = [];
        this.isChecked = false;
      } else {
        this.exportService.exportPfd(this.dataSource.data);
      }
      this.openExportMenu = false;
      window.location.reload();
    }
  }

}
