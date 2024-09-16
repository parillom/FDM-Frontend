import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {LocationService} from '../../../services/location.service';
import {ErrorHandlerService} from '../../../services/error-handler.service';
import {Location} from '../../../models/Location';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {DeleteDialogComponent} from '../../dialog/common/delete-dialog/delete-dialog.component';
import {Usecase} from '../../../models/Usecase';
import {DeleteMultipleDialogComponent} from '../../dialog/common/delete-multiple-dialog/delete-multiple-dialog.component';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Device} from '../../../models/Device';
import {AddLocationComponent} from '../../dialog/add-location/add-location.component';

@Component({
  selector: 'app-location-dashboard',
  templateUrl: './location-dashboard.component.html',
  styleUrl: './location-dashboard.component.scss'
})
export class LocationDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInputField!: ElementRef;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  locations: Location[] = [];
  selectedLocations: Location[] = [];
  locationSearch: string = '';
  dataSource!: MatTableDataSource<Location>;
  displayedColumns: string[] = ['Ort-ID', 'Name', 'Geräte', 'Aktionen'];
  isChecked: boolean = false;
  devicesMap: Map<number, Device[]> = new Map();
  expandedMap: Map<number, boolean> = new Map();
  limit: number = 10;

  columnWidths = {
    'Ort-ID': '15%',
    'Name': '10%',
    'Geräte': '40%'
  };

  constructor(private locationService: LocationService,
              private errorHandler: ErrorHandlerService,
              private router: Router,
              private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource<Location>()
  }

  ngOnInit() {
    this.getAllLocations();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchInputField.nativeElement.click();
    });
    this.dataSource!.paginator = this.paginator!;
  }

  filterWithAllProperties() {
    const vehicleSearchId = this.locationSearch ? this.locationSearch : '';
    const searchLower = this.locationSearch?.toLowerCase() || '';

    this.dataSource.data! = this.locations.filter(location => {
      const matchesId = location.uuId!.toString().includes(vehicleSearchId);
      const matchesName = location.name?.toLowerCase().includes(searchLower);

      return matchesId || matchesName;
    });
  }

  private getAllLocations() {
    this.locationService.getAllLocations().subscribe(res => {
      if (res && !this.errorHandler.hasError(res)) {
        this.locations = res.object;
        this.dataSource.data = this.locations;
        this.locations.forEach(location => {
          this.getDevicesFromLocation(location);
        });
      } else {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      }
    });
  }

  getDevicesFromLocation(location: Location) {
    this.locationService.getDevicesFromLocation(location).subscribe((response) => {
      if (response.object) {
        this.devicesMap.set(location.uuId, response.object);
      } else {
        this.errorHandler.setErrorMessage(response.errorMessage!);
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

  refreshDevices() {
    this.getAllLocations();
  }

  navigateToEdit(uuId: number) {
    void this.router.navigate(['fdm/dashboard/location/edit/'], {queryParams: {id: uuId}});
  }

  isLocationSelected(location: Location) {
    return this.selectedLocations.some(selectedLocation => selectedLocation.id === location.id);
  }

  openDeleteModal(location: Location) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      hasBackdrop: false,
      autoFocus: false,
      data: {
        object: location,
        useCase: Usecase.LOCATION
      }
    });
    dialogRef.componentInstance.delete!.subscribe(res => {
      if (res) {
        this.locationService.delete(location).subscribe(res => {
          if (this.errorHandler.hasError(res)) {
            this.errorHandler.setErrorMessage(res.errorMessage!);
            dialogRef.close();
          } else {
            this.errorHandler.setSuccessMessage(`Ort ${location.name} erfolgreich gelöscht`);
            this.getAllLocations();
            dialogRef.close();
          }
        });
      }
    });
  }

  openCreateLocationDialog() {
    const dialog = this.dialog.open(AddLocationComponent, {
      hasBackdrop: false,
      autoFocus: false
    });
    dialog.componentInstance.created.subscribe(created => {
      if (created) {
        this.getAllLocations();
        dialog.close();
      } else {
        dialog.close();
      }
    })
  }

  handleCheckboxClick(location: Location) {
    const index = this.selectedLocations.indexOf(location);
    if (index !== -1) {
      this.selectedLocations.splice(index, 1);
    } else {
      this.selectedLocations.push(location);
    }
    this.updateIsCheckedState();
  }

  private updateIsCheckedState() {
    this.isChecked = this.locations?.length === this.selectedLocations.length;
  }

  addAllDevices() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      this.locations!.forEach(location => {
        if (!this.selectedLocations.includes(location) && this.devicesMap.get(location.id!)?.length! < 1) {
          this.selectedLocations.push(location);
        }
      });
    }
    //Nach allem filtern
    else {
      const filteredDeviceIds = this.locations!.map(location => location.id);
      this.selectedLocations = this.selectedLocations.filter(location => !filteredDeviceIds.includes(location.id));
    }
  }

  openDeleteMultipleDialog() {
    const dialogRef = this.dialog.open(DeleteMultipleDialogComponent, {
      width: '400px',
      height: 'auto',
      hasBackdrop: false,
      autoFocus: false,
      data: {
        objectsToDelete: this.selectedLocations,
        useCase: Usecase.LOCATION
      }
    });
    dialogRef.componentInstance.objectRemoved!.subscribe((updatedVehiclesList) => {
      if (updatedVehiclesList.length !== this.locations.length) {
        this.isChecked = false;
      }
    });
    dialogRef.componentInstance.deleted!.subscribe(deleted => {
      if (deleted) {
        this.getAllLocations();
        this.selectedLocations = [];
        this.errorHandler.setSuccessMessage('Orte wurden erfolgreich gelöscht');
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
    return 'Es können nur Orte gelöscht werden, die mit keinen Geräten verknüpft sind.';
  }
}
