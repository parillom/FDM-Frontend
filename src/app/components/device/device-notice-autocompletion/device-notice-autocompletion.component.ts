import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DeviceNotice} from '../../../models/DeviceNotice';
import {DeviceState} from '../../../models/DeviceState';
import {DeviceType} from '../../../models/DeviceType';
import {DeviceSearch} from '../../../models/DeviceSearch';


@Component({
  selector: 'app-device-notice-autocompletion',
  templateUrl: './device-notice-autocompletion.component.html',
  styleUrl: './device-notice-autocompletion.component.scss'
})
export class DeviceNoticeAutocompletionComponent implements OnInit {
  notices: DeviceNotice[] = Object.values(DeviceNotice);
  filteredNotices: DeviceNotice[] = [];
  @Output() doFilter = new EventEmitter<DeviceSearch>();
  deviceSearch = new DeviceSearch();

  @Input()
  state?: DeviceState;

  @Input()
  vehicleName?: string;

  @Input()
  locationName?: string;

  @Input()
  type?: DeviceType;

  ngOnInit() {
    this.filteredNotices = this.notices;
  }

  filterNotices(event: any) {
    this.filteredNotices = this.notices?.filter(notice => notice!.toLowerCase().includes(event.target.value.toLowerCase()));
    const notice = event.target.value;

    this.deviceSearch = {
      state: this.state,
      vehicleName: this.vehicleName,
      locationName: this.locationName,
      type: this.type,
      notice: notice
    };

    this.doFilter.emit(this.deviceSearch);
  }

  setNoticeValue(notice: DeviceNotice) {
    this.deviceSearch = {
      state: this.state,
      vehicleName: this.vehicleName,
      locationName: this.locationName,
      type: this.type,
      notice: notice,
    };

    this.doFilter.emit(this.deviceSearch);
  }

}
