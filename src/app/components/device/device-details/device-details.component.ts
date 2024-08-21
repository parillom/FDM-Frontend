import {Component, OnInit} from '@angular/core';
import {DeviceService} from '../../../services/device.service';
import {ActivatedRoute} from '@angular/router';
import {ErrorHandlerService} from '../../../services/error-handler.service';
import {Device} from '../../../models/Device';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrl: './device-details.component.scss'
})
export class DeviceDetailsComponent implements OnInit {
  device?: Device;

  constructor(private deviceService: DeviceService,
              private route: ActivatedRoute,
              private errorHandler: ErrorHandlerService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const uuId = params['id'];
      if (uuId !== null && uuId !== undefined) {
        this.getDeviceDetails(uuId);
      }
    });
  }

  private getDeviceDetails(uuId: number) {
    this.deviceService.getDeviceWithUuId(uuId).subscribe(res => {
      if (this.errorHandler.hasError(res)) {
        this.errorHandler.setErrorMessage(res.errorMessage!);
      } else {
        this.device = res.object;
      }
    });
  }
}
