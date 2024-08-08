import {Component, OnInit} from '@angular/core';
import {VehicleService} from '../../../services/vehicle.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ErrorHandlerService} from '../../../services/error-handler.service';
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
import {ConfirmDialogComponent} from '../../dialog/common/confirm-dialog/confirm-dialog.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';

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
  selectedState: string = '';
  protected readonly DeviceState = DeviceState;
  showStateOption: boolean = false;
  showSpinner: boolean = false;
  rendered: boolean = false;
  nameValid = false;

  editVehicleForm: FormGroup = new FormGroup({
    vehicleName: new FormControl<string | null>('', Validators.required),
  });

  constructor(private vehicleService: VehicleService,
              private route: ActivatedRoute,
              private router: Router,
              private errorHandler: ErrorHandlerService,
              private locationService: LocationService,
              private navbarService: NavbarComponent,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(param => {
      this.uuid = param['id'];
    });
    this.getVehicle(this.uuid!);
    this.getVehicles();
    this.getLocations();
  }



  getVehicle(uuId: number) {
    this.vehicleService.getVehicle(uuId).subscribe(res => {
      if (res) {
        if (this.errorHandler.hasError(res)) {
          this.errorHandler.setErrorMessage(res.errorMessage!);
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
        if (this.errorHandler.hasError(res)) {
          this.errorHandler.setErrorMessage(res.errorMessage!);
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
    return this.selectedDevices.some(deviceInList => deviceInList.id === device.id);
  }

  save() {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      autoFocus: false,
      hasBackdrop: false
    });
    dialog.componentInstance.confirm.subscribe(confirmed => {
      if (confirmed) {
        this.performMoveCall()
      }
    });
  }

  performMoveCall() {
    if ((this.selectedVehicleName || this.selectedLocationName) && this.droppedDevices.length > 0 && this.selectedState) {
      if (this.selectedVehicleName) {
        this.selectedState = DeviceState.ACTIVE;
        this.vehicleService.saveUpdatedDevicesOfVehicle(this.selectedVehicleName, this.droppedDevices, true, this.selectedState).subscribe(res => {
          this.handleResponse(res);
        });
      } else {
        this.vehicleService.saveUpdatedDevicesOfVehicle(this.selectedLocationName, this.droppedDevices, false, this.selectedState).subscribe(res => {
          this.handleResponse(res);
        });
      }
    }
  }

  handleResponse(res: ModelAndError) {
    if (res) {
      if (this.errorHandler.hasError(res)) {
        this.errorHandler.setErrorMessage(res.errorMessage!)
      } else {
        this.errorHandler.setSuccessMessage('Die Geräte konnten erfolgreich verschoben werden');
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

  private getVehicles() {
    this.vehicleService.getAllVehicles().subscribe(res => {
      if (res) {
        if (this.errorHandler.hasError(res)) {
          this.errorHandler.setErrorMessage(res.errorMessage!);
        } else {
          this.vehicles = res.object;
        }
      }
    });
  }

  private getLocations() {
    this.locationService.getAllLocations().subscribe(res => {
      if (res && !this.errorHandler.hasError(res)) {
        this.locations = res.object;
      } else {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  setVehicleInput(vehicle: Vehicle) {
    if (vehicle.name) {
      this.selectedVehicleName = vehicle.name;
      this.selected = true;
      this.selectedLocationName = '';
      this.showStateOption = false;
      this.selectedState = DeviceState.ACTIVE;
    }
  }

  setLocationInput(location: Location) {
    if (location.name) {
      this.selectedLocationName = location.name;
      this.selected = true;
      this.selectedVehicleName = '';
      this.showStateOption = true;
      this.selectedState = '';
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

  updateVehicleName() {
    const newVehicleName = this.editVehicleForm.get('vehicleName')?.value;
    if (this.editVehicleForm.valid) {
      this.vehicleService.updateVehicleName(this.vehicle?.uuId, newVehicleName).subscribe(res => {
        if (res && !this.errorHandler.hasError(res)) {
          this.errorHandler.setSuccessMessage('Fahrzeug konnte bearbeitet werden');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          this.errorHandler.setErrorMessage(res.errorMessage!);
        }
      });
    }
  }

  checkIfNameHasChanged() {
    const vehicleName = this.editVehicleForm.get('vehicleName')?.value
    this.nameValid = this.editVehicleForm.valid && vehicleName.toUpperCase() !== this.vehicle?.name;
  }
}
