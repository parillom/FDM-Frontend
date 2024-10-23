import {Component, OnInit} from '@angular/core';
import {VehicleService} from '../../../services/vehicle.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResponseHandlerService} from '../../../services/response-handler.service';
import {Vehicle} from '../../../models/Vehicle';
import {Location} from '../../../models/Location';
import {Device} from '../../../models/Device';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ModelAndError} from '../../../models/ModelAndError';
import {LocationService} from '../../../services/location.service';
import {DeviceState} from '../../../models/DeviceState';
import {NavbarComponent} from '../../common/navbar/navbar.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../common/dialog/confirm-dialog/confirm-dialog.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MoveDevicesRequest} from '../../../models/MoveDevicesRequest';
import {StorageType} from '../../../models/StorageType';
import {Storage} from '../../../models/Storage';

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
  moveDevicesOption = true;
  selectedDevices: Device[] = [];
  isChecked: boolean = false;
  dropListIsChecked: boolean = false;
  filteredDevices: Device[] = [];
  vehicles: Vehicle[] = [];
  locations: Location[] = [];
  deviceSearch: string = '';
  selectedVehicleName: string = '';
  selectedLocationName: string = '';
  selected: boolean = false;
  selectedState: DeviceState;
  protected readonly DeviceState = DeviceState;
  showStateOption: boolean = false;
  showSpinner: boolean = false;
  rendered: boolean = false;
  isVehicle: boolean = false;
  nameValid = false;
  private storageId: string;
  isAdmin: boolean = false;

  editVehicleForm: FormGroup = new FormGroup({
    vehicleName: new FormControl<string | null>('', Validators.required),
  });
  selectedTabIndex = 0;

  constructor(private vehicleService: VehicleService,
              private route: ActivatedRoute,
              private router: Router,
              private responseHandler: ResponseHandlerService,
              private locationService: LocationService,
              private navbarService: NavbarComponent,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(param => {
      this.uuid = param['id'];
    });
    this.route.queryParams.subscribe(param => {
      this.isAdmin = param['admin'];
    });
    this.getVehicle(this.uuid!);
    this.getVehicles();
    this.getLocations();
  }


  getVehicle(uuId: number) {
    this.vehicleService.getVehicleByUuId(uuId).subscribe(res => {
      if (res) {
        if (this.responseHandler.hasError(res)) {
          this.responseHandler.setErrorMessage(res.errorMessage!);
        } else {
          this.vehicle = res.object;
          this.editVehicleForm.get('vehicleName')?.setValue(this.vehicle?.name);
          this.getDevicesFromVehicle(this.vehicle!);
          this.navbarService.setCurrentObjectName(this.vehicle?.name!);
        }
      }
    });
  }

  getDevicesFromVehicle(vehicle: Vehicle) {
    this.rendered = false;
    this.showSpinner = true;
    this.vehicleService.getDevicesFromVehicle(vehicle).subscribe(res => {
      if (res) {
        this.showSpinner = false;
        if (this.responseHandler.hasError(res)) {
          this.responseHandler.setErrorMessage(res.errorMessage!);
        } else {
          this.devices = res.object;
          this.filteredDevices = this.devices;
          this.rendered = true;
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

  changeVehicleOption(event: MatTabChangeEvent) {
    if (event.index === 0) {
      this.moveDevicesOption = true;
      this.getDevicesFromVehicle(this.vehicle!);
    } else if (event.index === 1) {
      this.moveDevicesOption = false;
    }
  }

  isDeviceSelected(device: Device) {
    return this.selectedDevices.some(deviceInList => deviceInList.uuId === device.uuId);
  }

  save() {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      autoFocus: false,
      hasBackdrop: false
    });
    dialog.componentInstance.confirm.subscribe(confirmed => {
      if (confirmed) {
        this.performMoveCall();
      }
    });
  }

  performMoveCall() {
    if ((this.selectedVehicleName || this.selectedLocationName) && this.droppedDevices.length > 0 && this.selectedState) {
      if (this.selectedVehicleName) {
        this.vehicleService.getVehicleByName(this.selectedVehicleName).subscribe(res => {
          this.storageId = res.object.uuid;
          this.move(StorageType.VEHICLE, DeviceState.ACTIVE);
        });
      } else if (this.selectedLocationName) {
        this.locationService.getLocationByName(this.selectedLocationName).subscribe(res => {
          this.storageId = res.object.uuid;
          this.move(StorageType.LOCATION, this.selectedState);
        });
      }
    }
  }

  move(storageType: StorageType, state: DeviceState) {
    const objectListIds = this.droppedDevices.map(device => device.uuId);
    const objectListIdsAsString: string[] = [];

    objectListIds.forEach(object => {
      objectListIdsAsString.push(object.toString());
    });


    const request: MoveDevicesRequest = {
      storageId: this.storageId,
      deviceList: objectListIdsAsString,
      state: state,
      storageType: storageType
    };

    this.vehicleService.moveDevices(request).subscribe(res => {
      this.handleResponse(res);
    });
  }

  handleResponse(res: ModelAndError) {
    if (res) {
      if (this.responseHandler.hasError(res)) {
        this.responseHandler.setErrorMessage(res.errorMessage!);
      } else {
        this.responseHandler.setSuccessMessage('Die Geräte konnten erfolgreich verschoben werden');
        this.droppedDevices.splice(0);
        this.selectedDevices.splice(0);
        this.getVehicle(this.uuid!);
        this.selected = false;
        this.showStateOption = false;
      }
    }
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
    const index = this.selectedDevices.findIndex(selectedDevice => selectedDevice.uuId === device.uuId);
    if (index !== -1) {
      this.selectedDevices.splice(index, 1);
    } else {
      this.selectedDevices.push(device);
    }
    this.updateIsCheckedState();
  }

  updateIsCheckedState() {
    this.isChecked = this.filteredDevices.length === this.selectedDevices.length!;
  }

  handleCheckboxClickDropped(device: Device) {
    const index = this.selectedDevices.findIndex(selectedDevice => selectedDevice.uuId === device.uuId);
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
      !this.droppedDevices.some(droppedDevice => droppedDevice.uuId === device.uuId) &&
      device.name?.toLowerCase().includes(searchLower)
    );
  }

  private getVehicles() {
    this.vehicleService.getAll().subscribe(res => {
      if (res) {
        if (this.responseHandler.hasError(res)) {
          this.responseHandler.setErrorMessage(res.errorMessage!);
        } else {
          this.vehicles = res.object;
        }
      }
    });
  }

  private getLocations() {
    this.locationService.getAll().subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.locations = res.object;
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  setVehicleInput(vehicle: Vehicle) {
    if (vehicle.name) {
      this.selectedVehicleName = vehicle.name;
      this.isVehicle = true;
      this.selected = true;
      this.selectedLocationName = '';
      this.showStateOption = false;
      this.selectedState = DeviceState.ACTIVE;
    }
  }

  setLocationInput(location: Location) {
    if (location.name) {
      this.isVehicle = false;
      this.selectedLocationName = location.name;
      this.selected = true;
      this.selectedVehicleName = '';
      this.showStateOption = true;
      this.selectedState = undefined;
    }
  }

  openVehicleAndLocationSearch() {
    this.selected = false;
    this.showStateOption = false;
  }

  stateFilterChanged(value: any) {
    this.selectedState = value;
  }

  navigateToVehicleDashboard() {
    void this.router.navigate(['fdm/dashboard/vehicle']);
  }

  updateVehicle() {
    const newVehicleName = this.editVehicleForm.get('vehicleName')?.value;
    if (this.editVehicleForm.valid) {
      const request: Storage = {
        uuid: this.vehicle.uuid,
        name: newVehicleName
      };

      this.vehicleService.update(request).subscribe(res => {
        if (res && !this.responseHandler.hasError(res)) {
          this.responseHandler.setSuccessMessage(`${res.object.name} erfolgreich bearbeitet`);
          this.editVehicleForm.get('vehicleName').setValue(res.object.name);
        } else {
          this.responseHandler.setErrorMessage(res.errorMessage!);
        }
      });
    }
  }

  checkIfNameHasChanged() {
    const vehicleName = this.editVehicleForm.get('vehicleName')?.value;
    this.nameValid = this.editVehicleForm.valid && vehicleName.toUpperCase() !== this.vehicle?.name;
  }

  filterVehicles(vehicles: Vehicle[]) {
    return vehicles.filter(vehicle => vehicle.name !== this.vehicle.name);
  }

  navigateToUserVehicleDashboard() {
    void this.router.navigate(['/fdm/user/vehicles']);
  }
}
