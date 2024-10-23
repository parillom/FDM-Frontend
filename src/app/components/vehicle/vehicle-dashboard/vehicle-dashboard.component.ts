import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {VehicleService} from '../../../services/vehicle.service';
import {MatTableDataSource} from '@angular/material/table';
import {Vehicle} from '../../../models/Vehicle';
import {MatPaginator} from '@angular/material/paginator';
import {
  DeleteMultipleDialogComponent
} from '../../common/dialog/delete-multiple-dialog/delete-multiple-dialog.component';
import {Usecase} from '../../../models/Usecase';
import {MatDialog} from '@angular/material/dialog';
import {ResponseHandlerService} from '../../../services/response-handler.service';
import {DeleteDialogComponent} from '../../common/dialog/delete-dialog/delete-dialog.component';
import {AddVehicleComponent} from '../dialog/add-vehicle/add-vehicle.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-vehicle-dashboard',
  templateUrl: './vehicle-dashboard.component.html',
  styleUrl: './vehicle-dashboard.component.scss'
})
export class VehicleDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild('searchInput') searchInputField!: ElementRef;

  displayedColumns: string[] = ['Name', 'Geräte', 'Aktionen'];
  dataSource!: MatTableDataSource<Vehicle>;
  vehicles: Vehicle[] = [];
  vehicleSearch?: '';
  vehicleMap: Map<string, Vehicle[]> = new Map();
  limit = 10;
  expandedMap = new Map<string, boolean>();
  showSpinner: boolean = false;
  selectedVehicles: Vehicle[] = [];
  isChecked: boolean = false;

  columnWidths = {
    'Fahrzeug-ID': '15%',
    'Name': '10%',
    'Geräte': '40%'
  };

  constructor(private vehicleService: VehicleService,
              private dialog: MatDialog,
              private responseHandler: ResponseHandlerService,
              private router: Router) {
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
    this.vehicleService.getAll().subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.dataSource.data! = res.object;
        this.vehicles = res.object;
        this.vehicles.forEach(vehicle => {
          this.getDevicesFromVehicle(vehicle);
        });
        this.showSpinner = false;
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  filterWithAllProperties() {
    const vehicleSearchId = this.vehicleSearch ? this.vehicleSearch : '';
    const searchLower = this.vehicleSearch?.toLowerCase() || '';

    this.dataSource.data! = this.vehicles.filter(vehicle => {
      const matchesId = vehicle.uuid!.toString().includes(vehicleSearchId);
      const matchesName = vehicle.name?.toLowerCase().includes(searchLower);

      return matchesId || matchesName;
    });
  }

  getDevicesFromVehicle(vehicle: Vehicle) {
    this.vehicleService.getDevicesFromVehicle(vehicle).subscribe((response) => {
      if (response.object) {
        this.vehicleMap.set(vehicle.uuid!, response.object);
      }
    });
  }

  getLimitedDevices(id: string): string {
    const devices = this.vehicleMap.get(id);
    const isExpanded = this.expandedMap.get(id);
    if (!devices) {
      return '';
    }
    if (isExpanded) {
      return devices.map(device => `<span>${device.name}</span>`).join(', ');
    } else {
      if (devices.length > this.limit) {
        return devices.slice(0, this.limit).map(device => `<span>${device.name}</span>`).join(', ');
      } else {
        return devices.map(device => `<span>${device.name}</span>`).join(', ');
      }
    }
  }

  toggleExpand(id: string): void {
    const isExpanded = this.expandedMap.get(id);
    this.expandedMap.set(id, !isExpanded);
  }

  refreshVehicles() {
    this.getAllVehicles();
  }

  navigateToEdit(uuid: number) {
    void this.router.navigate(['fdm/dashboard/vehicle/edit/'], {queryParams: {id: uuid}});
  }

  openDeleteModal(vehicle: Vehicle, event: MouseEvent) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      hasBackdrop: false,
      autoFocus: false,
      data: {
        object: vehicle,
        useCase: Usecase.VEHICLE
      }
    });
    dialogRef.componentInstance.delete!.subscribe(res => {
      if (res) {
        const uuIds = [];
        uuIds.push(vehicle.uuid);
        this.vehicleService.delete(uuIds).subscribe(res => {
          if (this.responseHandler.hasError(res)) {
            this.responseHandler.setErrorMessage(res.errorMessage!);
            dialogRef.close();
          } else {
            this.responseHandler.setSuccessMessage(`Fahrzeug ${vehicle.name} erfolgreich gelöscht`);
            this.getAllVehicles();
            dialogRef.close();
          }
        });
      }
    });
  }

  openCreateVehicleDialog() {
    const dialog = this.dialog.open(AddVehicleComponent, {
      hasBackdrop: false,
      autoFocus: false
    });
    dialog.componentInstance.created.subscribe(created => {
      if (created) {
        this.getAllVehicles();
        dialog.close();
      } else {
        dialog.close();
      }
    });
    dialog.componentInstance.manyCreatedSuccessful.subscribe(created => {
      if (created) {
        this.getAllVehicles();
        dialog.close();
      }
    });
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
    const count = this.vehicles.filter(vehicle => this.vehicleMap.get(vehicle.uuid)?.length === 0).length;
    this.isChecked = count === this.selectedVehicles.length;
  }

  handleRowClick(vehicle: Vehicle) {
    if (this.vehicles.length > 1 && this.vehicleMap.get(vehicle.uuid).length === 0) {
      const index = this.selectedVehicles.indexOf(vehicle);
      if (index !== -1) {
        this.selectedVehicles.splice(index, 1);
      } else {
        this.selectedVehicles.push(vehicle);
      }
      this.updateIsCheckedState();
    }
  }

  isVehicleSelected(vehicle: Vehicle) {
    return this.selectedVehicles.some(selectedVehicle => selectedVehicle.uuid === vehicle.uuid);
  }

  addAllVehicles() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      this.vehicles!.forEach(vehicle => {
        if (!this.selectedVehicles.includes(vehicle) && this.vehicleMap.get(vehicle.uuid!).length! < 1) {
          this.selectedVehicles.push(vehicle);
        }
      });
    } else {
      const filteredVehicleIds = this.vehicles.map(vehicle => vehicle.uuid);
      this.selectedVehicles = this.selectedVehicles.filter(vehicle => !filteredVehicleIds.includes(vehicle.uuid));
      this.selectedVehicles = this.selectedVehicles.filter(vehicle => !filteredVehicleIds.includes(vehicle.uuid));
    }
  }

  openDeleteMultipleDialog() {
    const dialogRef = this.dialog.open(DeleteMultipleDialogComponent, {
      width: '400px',
      height: 'auto',
      hasBackdrop: false,
      autoFocus: false,
      data: {
        objectsToDelete: this.selectedVehicles,
        useCase: Usecase.VEHICLE
      }
    });
    dialogRef.componentInstance.objectRemoved!.subscribe((updatedVehiclesList) => {
      if (updatedVehiclesList.length !== this.vehicles.length) {
        this.isChecked = false;
      }
    });
    dialogRef.componentInstance.deleted!.subscribe(deleted => {
      if (deleted) {
        this.getAllVehicles();
        this.selectedVehicles = [];
        this.responseHandler.setSuccessMessage('Fahrzeuge wurden erfolgreich gelöscht');
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

  getTooltipActionsText(): string {
    return 'Es können nur Fahrzeuge gelöscht werden, die mit keinen Geräten verknüpft sind.';
  }

  devicesLinked() {
    return this.vehicleMap.size === 0 || Array.from(this.vehicleMap.values()).every(vehicles => vehicles.length > 0);
  }
}
