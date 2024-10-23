import {Component, OnInit} from '@angular/core';
import {Device} from '../../../models/Device';
import {DeviceService} from '../../../services/device.service';
import {ActivatedRoute} from '@angular/router';
import {ResponseHandlerService} from '../../../services/response-handler.service';
import {DeviceHistory} from '../../../models/DeviceHistory';
import {UpdateType} from '../../../models/UpdateType';
import {StorageType} from '../../../models/StorageType';
import {WorkflowFilter} from '../../../models/WorkflowFilter';

@Component({
  selector: 'app-device-workflow',
  templateUrl: './device-workflow.component.html',
  styleUrl: './device-workflow.component.scss'
})
export class DeviceWorkflowComponent implements OnInit {
  uuid: number;
  device: Device;
  historyEntries: DeviceHistory[] = [];
  filteredHistoryEntries: DeviceHistory[] = [];
  historyFilter = new WorkflowFilter();

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
        this.filteredHistoryEntries = this.historyEntries;
      } else {
        this.responseHandler.setErrorMessage(res.errorMessage);
      }
    });
  }

  filter() {
    this.historyFilter = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      updateType: this.updateType
    };

    this.doFilter(this.historyFilter);
  }

  doFilter(request: WorkflowFilter) {
    this.filteredHistoryEntries = this.historyEntries
      .filter(entry => !request?.updateType || request.updateType === entry.updateType)
      .filter(entry => !request.fromDate || new Date(entry.updateDate) >= new Date(request.fromDate))
      .filter(entry => {
        const entryDate = new Date(entry.updateDate);
        const endOfToDate: Date = request.toDate ? new Date(request.toDate) : null;
        if (endOfToDate) {
          entryDate.setHours(0, 0, 0, 0);
          endOfToDate.setHours(0, 0, 0, 0);
          return entryDate <= endOfToDate;
        }
        return true;
      });
  }


  translateStorageType(storageType: StorageType): string {
    switch (storageType) {
      case StorageType.VEHICLE:
        return 'Fahrzeug';
      case StorageType.LOCATION:
        return 'Ort';
    }
  }

  resetFilter() {
    this.updateType = undefined;
    this.toDate = undefined;
    this.fromDate = undefined;

    this.historyFilter = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      updateType: this.updateType
    };

    this.doFilter(this.historyFilter);
  }
}
