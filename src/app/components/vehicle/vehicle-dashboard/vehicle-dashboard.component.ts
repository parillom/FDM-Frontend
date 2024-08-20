import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {VehicleService} from '../../../services/vehicle.service';
import {MatTableDataSource} from '@angular/material/table';
import {Vehicle} from '../../../models/Vehicle';
import {MatPaginator} from '@angular/material/paginator';
import {DeleteMultipleDialogComponent} from '../../dialog/common/delete-multiple-dialog/delete-multiple-dialog.component';
import {Usecase} from '../../../models/Usecase';
import {MatDialog} from '@angular/material/dialog';
import {ErrorHandlerService} from '../../../services/error-handler.service';
import {DeleteDialogComponent} from '../../dialog/common/delete-dialog/delete-dialog.component';
import {AddVehicleComponent} from '../../dialog/add-vehicle/add-vehicle.component';
import {Router} from '@angular/router';

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
  vehicleMap: Map<number, Vehicle[]> = new Map();
  limit = 10;
  expandedMap = new Map<number, boolean>();
  showSpinner: boolean = false;
  selectedVehicles: Vehicle[] = [];
  isChecked: boolean = false;

  columnWidths = {
    'Fahrzeug-ID': '15%',
    'Name': '10%',
    'Geräte': '40%'
  }

  constructor(private vehicleService: VehicleService,
              private dialog: MatDialog,
              private errorHandler: ErrorHandlerService,
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
    this.vehicleService.getAllVehicles().subscribe(res => {
      if (res && !this.errorHandler.hasError(res)) {
        this.dataSource.data! = res.object;
        this.vehicles = res.object;
        this.vehicles.forEach(vehicle => {
          this.getDevicesFromVehicle(vehicle);
        });
        this.showSpinner = false;
      } else {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  filterWithAllProperties() {
    const vehicleSearchId = this.vehicleSearch ? this.vehicleSearch : '';
    const searchLower = this.vehicleSearch?.toLowerCase() || '';

    this.dataSource.data! = this.vehicles.filter(vehicle => {
      const matchesId = vehicle.uuId!.toString().includes(vehicleSearchId);
      const matchesName = vehicle.name?.toLowerCase().includes(searchLower);

      return matchesId || matchesName;
    });
  }

  getDevicesFromVehicle(vehicle: Vehicle) {
    this.vehicleService.getDevicesFromVehicle(vehicle).subscribe((response) => {
      if (response.object) {
        this.vehicleMap.set(vehicle.id!, response.object);
      }
    });
  }

  getLimitedDevices(id: number): string {
    const devices = this.vehicleMap.get(id);
    const isExpanded = this.expandedMap.get(id);
    if (!devices) {
      return '';
    }
    if (isExpanded) {
      return devices.map(device => `<span class="text-info">${device.name}</span>`).join(', ');
    } else {
      if (devices.length > this.limit) {
        return devices.slice(0, this.limit).map(device => `<span class="text-info">${device.name}</span>`).join(', ');
      } else {
        return devices.map(device => `<span class="text-info">${device.name}</span>`).join(', ');
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

  navigateToEdit(uuId: number) {
    void this.router.navigate(['fdm/dashboard/vehicle/edit/'], {queryParams: {id: uuId}});
  }

  openDeleteModal(vehicle: Vehicle) {
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
        this.vehicleService.delete(vehicle).subscribe(res => {
          if (this.errorHandler.hasError(res)) {
            this.errorHandler.setErrorMessage(res.errorMessage!);
            dialogRef.close();
          } else {
            this.errorHandler.setSuccessMessage(`Fahrzeug ${vehicle.name} erfolgreich gelöscht`);
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

  handleCheckboxClick(vehicle: Vehicle) {
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

  handleRowClick(vehicle: Vehicle) {
    if (this.vehicles!.length > 1 && this.vehicleMap.get(vehicle.id!)?.length === 0) {
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
    return this.selectedVehicles.some(selectedVehicle => selectedVehicle.id === vehicle.id);
  }

  addAllVehicles() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      this.vehicles!.forEach(vehicle => {
        if (!this.selectedVehicles.includes(vehicle) && this.vehicleMap.get(vehicle.id!)?.length! < 1) {
          this.selectedVehicles.push(vehicle);
        }
      });
    } else {
      const filteredVehicleIds = this.vehicles!.map(vehicle => vehicle.id);
      this.selectedVehicles = this.selectedVehicles.filter(vehicle => !filteredVehicleIds.includes(vehicle.id));
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

  getTooltipActionsText(): string {
    return 'Es können nur Fahrzeuge gelöscht werden die mit keinen Geräten verknüpft sind.';
  }
}
