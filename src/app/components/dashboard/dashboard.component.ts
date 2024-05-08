import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DeviceService} from '../../services/device.service';
import {Device} from '../../models/Device';
import {MatDialog} from '@angular/material/dialog';
import {EditDialogComponent} from '../edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput') searchInputField!: ElementRef;

  devices?: Device[] = [];
  filteredDevices?: Device[] = [];
  showForm?: boolean = false;
  deviceSearch?: '';

  constructor(private deviceService: DeviceService,
              private dialog: MatDialog) {
  }
  ngOnInit() {
    this.getAllDevices();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchInputField.nativeElement.click();
    });
  }

  getAllDevices() {
    return this.deviceService.getAllDevices().subscribe(devices => {
      if (devices) {
        this.devices = devices;
        this.filteredDevices = devices;
      }
    });
  }

  filterDevices() {
    const deviceSearchId = Number(this.deviceSearch!);
    this.filteredDevices = this.devices?.filter(device =>
      device.id === deviceSearchId ||
      device.name?.toLowerCase().includes(this.deviceSearch!.toLowerCase()) ||
      device.location?.name?.toLowerCase().includes(this.deviceSearch!.toLowerCase()) ||
      device.status?.deviceState?.toLowerCase().includes(this.deviceSearch!.toLowerCase())
    );
  }

  showCreateForm() {
    this.showForm = true;
  }

  openEditModal(device: Device) {
    const modal = this.dialog.open(EditDialogComponent, {
      width: '30%',
      height: '45%',
      data: {
        device: device
      }
    })
  }

  openDeleteModal(device: Device) {
  }

  closeForm() {
    this.showForm = false;
  }
}
