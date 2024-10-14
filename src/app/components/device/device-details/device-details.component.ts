import {Component, OnInit} from '@angular/core';
import {DeviceService} from '../../../services/device.service';
import {ActivatedRoute} from '@angular/router';
import {ResponseHandlerService} from '../../../services/response-handler.service';
import {Device} from '../../../models/Device';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrl: './device-details.component.scss'
})
export class DeviceDetailsComponent implements OnInit {
  device: Device;

  constructor(private deviceService: DeviceService,
              private route: ActivatedRoute,
              private responseHandler: ResponseHandlerService) {
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
    this.deviceService.getWithUuid(uuId).subscribe(res => {
      if (this.responseHandler.hasError(res)) {
        this.responseHandler.setErrorMessage(res.errorMessage!);
      } else {
        this.device = res.object;
      }
    });
  }
}
