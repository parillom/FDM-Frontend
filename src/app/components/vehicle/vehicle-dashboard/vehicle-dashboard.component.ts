import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {VehicleService} from '../../../services/vehicle.service';
import {MatTableDataSource} from '@angular/material/table';
import {Vehicle} from '../../../models/Vehicle';
import {MatPaginator} from '@angular/material/paginator';
import {Device} from '../../../models/Device';
import {DeleteMultipleDevicesDialog} from '../../dialog/delete-multiple-devices-dialog/delete-multiple-devices-dialog';
import {Usecase} from '../../../models/Usecase';
import {MatDialog} from '@angular/material/dialog';
import {ErrorHandlerService} from '../../../services/error-handler.service';

@Component({
  selector: 'app-vehicle-dashboard',
  templateUrl: './vehicle-dashboard.component.html',
  styleUrl: './vehicle-dashboard.component.scss'
})
export class VehicleDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild('searchInput') searchInputField!: ElementRef;

  displayedColumns: string[] = ['Fahrzeug-ID', 'Name', 'Geräte', 'Aktionen'];
  dataSource!: MatTableDataSource<Vehicle>;
  vehicles: Vehicle[] = [];
  vehicleSearch?: '';
  devicesMap: Map<number, Device[]> = new Map();
  limit = 10;
  expandedMap = new Map<number, boolean>();
  showSpinner: boolean = false;
  selectedVehicles: Vehicle[] = [];
  isChecked: boolean = false;
  mydev!: Device[];

  constructor(private vehicleService: VehicleService,
              private dialog: MatDialog,
              private errorHandler: ErrorHandlerService) {
    this.dataSource = new MatTableDataSource<Vehicle>();
  }

  ngOnInit() {
    this.getAllVehicles();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchInputField.nativeElement.click();
    });
    this.dataSource!.paginator = this.paginator!;
  }

  getAllVehicles() {
    this.showSpinner = true;
    this.vehicleService.getAllVehicles().subscribe(vehicles => {
      if (vehicles) {
        this.dataSource.data! = vehicles;
        this.vehicles = vehicles;
        this.vehicles.forEach(vehicle => {
          this.getDevicesFromVehicle(vehicle);
        });
        this.showSpinner = false;
      }

    });
  }

  filterWithAllProperties() {
    const vehicleSearchId = this.vehicleSearch ? this.vehicleSearch : '';
    const searchLower = this.vehicleSearch?.toLowerCase() || '';

    this.dataSource.data! = this.vehicles.filter(vehicle => {
      const matchesId = vehicle.id!.toString().includes(vehicleSearchId);
      const matchesName = vehicle.name?.toLowerCase().includes(searchLower);

      return matchesId || matchesName;
    });
  }

  getDevicesFromVehicle(vehicle: Vehicle) {
    this.vehicleService.getDevicesFromVehicle(vehicle).subscribe((response) => {
      if (response.object) {
        this.devicesMap.set(vehicle.id!, response.object);
      }
    });
  }

  getLimitedDevices(id: number): string {
    const devices = this.devicesMap.get(id);
    const isExpanded = this.expandedMap.get(id);
    if (!devices) {
      return '';
    }
    if (isExpanded) {
      return devices.map(device => `[${device.name}]`).join(' ');
    } else {
      if (devices.length > this.limit) {
        return devices.slice(0, this.limit).map(device => `[${device.name}]`).join(' ');
      } else {
        return devices.map(device => `[${device.name}]`).join(' ');
      }
    }
  }

  toggleExpand(id: number): void {
    const isExpanded = this.expandedMap.get(id);
    this.expandedMap.set(id, !isExpanded);
  }

  refreshVehicles() {
    this.getAllVehicles();
  }


  openEditModal(element: Vehicle) {

  }

  isVehicleSelected(vehicle: Vehicle) {
    return this.selectedVehicles.some(selectedVehicle => selectedVehicle.id === vehicle.id);
  }

  openDeleteModal(vehicle: Vehicle) {

  }

  handleCheckboxClick(vehicle: Vehicle, event: MouseEvent) {
    event.stopPropagation();
    const index = this.selectedVehicles.indexOf(vehicle);
    if (index !== -1) {
      this.selectedVehicles.splice(index, 1);
    } else {
      this.selectedVehicles.push(vehicle);
    }
    this.updateIsCheckedState();
  }

  private updateIsCheckedState() {
    this.isChecked = this.vehicles?.length === this.selectedVehicles.length;
  }

  addAllDevices() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      this.selectedVehicles.push(...this.vehicles);
    }
    //Nach allem filtern
    else {
      const filteredDeviceIds = this.vehicles!.map(vehicle => vehicle.id);
      this.selectedVehicles = this.selectedVehicles.filter(vehicle => !filteredDeviceIds.includes(vehicle.id));
    }
  }

  openDeleteMultipleDialog() {
    const dialogRef = this.dialog.open(DeleteMultipleDevicesDialog, {
      width: '400px',
      height: 'auto',
      hasBackdrop: false,
      autoFocus: false,
      data: {
        objectsToDelete: this.selectedVehicles,
        useCase: Usecase.VEHICLE
      }
    });
    dialogRef.componentInstance.change!.subscribe((updatedVehiclesList) => {
      if (updatedVehiclesList.length !== this.vehicles!.length) {
        this.isChecked = false;
      }
    });
    dialogRef.componentInstance.deleted!.subscribe(deleted => {
      if (deleted) {
        this.getAllVehicles();
        this.selectedVehicles = [];
        this.errorHandler.setSuccessMessage('Fahrzeuge wurden erfolgreich gelöscht');
        dialogRef.close();
        if (this.isChecked) {
          this.isChecked = false;
        }
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      dialogRef.componentInstance.deleted!.unsubscribe();
    });
  }

  getTooltipActionsTest(): string {
    return 'Es können nur Fahrzeuge gelöscht werden die mit keinen Geräten verknüpft sind.'
  }
}
