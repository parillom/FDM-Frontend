import {Component, OnInit} from '@angular/core';
import {Device} from '../../../models/Device';
import {DeviceService} from '../../../services/device.service';
import {ActivatedRoute} from '@angular/router';
import {ResponseHandlerService} from '../../../services/response-handler.service';
import {DeviceHistory} from '../../../models/DeviceHistory';
import {UpdateType} from '../../../models/UpdateType';

@Component({
  selector: 'app-device-workflow',
  templateUrl: './device-workflow.component.html',
  styleUrl: './device-workflow.component.scss'
})
export class DeviceWorkflowComponent implements OnInit {
  uuid: number;
  device: Device;
  historyEntries: DeviceHistory[] = [];

  protected readonly UpdateType = UpdateType;
  updateType: UpdateType;
  toDate: Date;
  fromDate: Date;
  showDateError: boolean = false;

  constructor(private deviceService: DeviceService,
              private router: ActivatedRoute,
              private responseHandler: ResponseHandlerService) {
  }

  ngOnInit() {
    this.router.queryParams.subscribe(param => {
      this.uuid = param['uuId'];
    });

    this.deviceService.getWithUuid(this.uuid).subscribe(res => {
      if (res && !this.responseHandler.hasError(res)) {
        this.device = res.object;
        this.historyEntries = this.device.historyEntries;
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage);
      }
    });
  }

}
