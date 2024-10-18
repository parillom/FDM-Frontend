import {Component, OnInit} from '@angular/core';
import {Vehicle} from '../../../models/Vehicle';
import {Device} from '../../../models/Device';
import {Location} from '../../../models/Location';
import {CreateStorage} from '../../../models/CreateStorage';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {VehicleService} from '../../../services/vehicle.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResponseHandlerService} from '../../../services/response-handler.service';
import {LocationService} from '../../../services/location.service';
import {NavbarComponent} from '../../common/navbar/navbar.component';
import {MatDialog} from '@angular/material/dialog';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ConfirmDialogComponent} from '../../common/dialog/confirm-dialog/confirm-dialog.component';
import {StorageType} from '../../../models/StorageType';
import {MoveDevicesRequest} from '../../../models/MoveDevicesRequest';
import {ModelAndError} from '../../../models/ModelAndError';
import {Storage} from '../../../models/Storage';
import {DeviceState} from '../../../models/DeviceState';

@Component({
  selector: 'app-location-edit',
  templateUrl: './location-edit.component.html',
  styleUrl: './location-edit.component.scss'
})
export class LocationEditComponent implements OnInit{
  uuid?: string;
  location?: Vehicle;
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
  showStateOption: boolean = false;
  showSpinner: boolean = false;
  rendered: boolean = false;
  isVehicle: boolean = false;
  nameValid = false;
  storageId: string;
  protected readonly DeviceState = DeviceState;

  editLocationForm: FormGroup = new FormGroup({
    locationName: new FormControl<string | null>('', Validators.required),
  });

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
    this.getLocation(this.uuid!);
    this.getVehicles();
    this.getLocations();
  }


  getLocation(uuId: string) {
    this.locationService.getLocationByUuId(uuId).subscribe(res => {
      if (res) {
        if (this.responseHandler.hasError(res)) {
          this.responseHandler.setErrorMessage(res.errorMessage!);
        } else {
          this.location = res.object;
          this.editLocationForm.get('locationName')?.setValue(this.location?.name);
          this.getDevicesFromLocation(this.location!);
          this.navbarService.setCurrentObjectName(this.location?.name!);
        }
      }
    });
  }

  getDevicesFromLocation(location: Location) {
    this.rendered = false;
    this.showSpinner = true;
    this.locationService.getDevicesFromLocation(location).subscribe(res => {
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

  changeLocationOption(event: MatTabChangeEvent) {
    if (event.index === 0) {
      this.moveDevicesOption = true;
      this.getDevicesFromLocation(this.location!);
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

    this.locationService.moveDevices(request).subscribe(res => {
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
        this.getLocation(this.uuid!);
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
    this.isChecked = this.filteredDevices.length === this.selectedDevices.length;
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

  navigateToLocationDashboard() {
    void this.router.navigate(['fdm/dashboard/location']);
  }

  updateLocation() {
    const newLocationName = this.editLocationForm.get('locationName')?.value;
    if (this.editLocationForm.valid) {
      const request: Storage = {
        uuid: this.location.uuid,
        name: newLocationName
      };

      this.locationService.update(request).subscribe(res => {
        if (res && !this.responseHandler.hasError(res)) {
          this.responseHandler.setSuccessMessage(`${res.object.name} erfolgreich bearbeitet`);
          this.editLocationForm.get('locationName').setValue(res.object.name);
        } else {
          this.responseHandler.setErrorMessage(res.errorMessage!);
        }
      });
    }
  }

  checkIfNameHasChanged() {
    const locationName = this.editLocationForm.get('locationName')?.value;
    this.nameValid = this.editLocationForm.valid && locationName.toUpperCase() !== this.location?.name;
  }

  filterLocations(locations: Location[]) {
    return locations.filter(location => location.name !== this.location.name);
  }
}
