import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Device} from '../../../models/Device';
import {DeviceService} from '../../../services/device.service';
import {ResponseHandlerService} from '../../../services/response-handler.service';

@Component({
  selector: 'app-user-as-dashboard',
  templateUrl: './user-as-dashboard.component.html',
  styleUrl: './user-as-dashboard.component.scss'
})
export class UserAsDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('asSearchInput') asSearchInput: ElementRef;

  asDevices: Device[] = [];
  devices: Device[] = [];
  filteredDevices: Device[] = [];
  asSearch = 'BF-';

  constructor(private router: Router,
              private deviceService: DeviceService,
              private responseHandler: ResponseHandlerService) {
  }

  ngOnInit() {
    this.getAllDevices();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.asSearchInput.nativeElement.click();
    });
  }

  private getAllDevices() {
    this.deviceService.getAll().subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.devices = res.object;
        this.setAsDevices();
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage);
      }
    });
  }

  private setAsDevices() {
    this.asDevices = this.devices.filter(device => device.name.includes('BF'));
    this.filteredDevices = this.asDevices;
  }

  navigateToDashboard() {
    void this.router.navigate(['/fdm/user/dashboard']);
  }


  filterAsDevices(event: any) {
    console.log(event.target.value)
    this.filteredDevices = this.asDevices?.filter(device => device.name.toUpperCase().includes(event.target.value.toUpperCase()));
  }
}
