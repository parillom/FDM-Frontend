import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DeviceType} from '../../../models/DeviceType';
import {DeviceState} from '../../../models/DeviceState';
import {DeviceSearch} from '../../../models/DeviceSearch';
import {DeviceNotice} from '../../../models/DeviceNotice';

@Component({
  selector: 'app-device-type-autocompletion',
  templateUrl: './device-type-autocompletion.component.html',
  styleUrl: './device-type-autocompletion.component.scss',
})
export class DeviceTypeAutocompletionComponent implements OnInit {
  types: DeviceType[] = Object.values(DeviceType);
  filteredTypes: DeviceType[] = [];
  @Output() doFilter = new EventEmitter<DeviceSearch>();
  deviceSearch = new DeviceSearch();
  typeAutocomplete: string = '';

  @Input()
  state?: DeviceState;

  @Input()
  vehicleName?: string;

  @Input()
  locationName?: string;

  @Input()
  notice?: DeviceNotice;

  ngOnInit() {
    this.filteredTypes = this.types;
  }

  filterTypes(event: any) {
    this.filteredTypes = this.types?.filter(type => type!.toLowerCase().includes(event.target.value.toLowerCase()));
    const type = event.target.value;

    this.deviceSearch = {
      state: this.state,
      vehicleName: this.vehicleName,
      locationName: this.locationName,
      type: type,
      notice: this.notice,
    };

    this.doFilter.emit(this.deviceSearch);
  }

  setTypeValue(type: DeviceType) {
    this.deviceSearch = {
      state: this.state,
      vehicleName: this.vehicleName,
      locationName: this.locationName,
      type: type,
      notice: this.notice,
    };

    this.doFilter.emit(this.deviceSearch);
  }

  resetFields() {
    this.typeAutocomplete = undefined;
  }


}
