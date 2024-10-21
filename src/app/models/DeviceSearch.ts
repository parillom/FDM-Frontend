/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import {DeviceState} from './DeviceState';
import {DeviceType} from './DeviceType';
import {DeviceNotice} from './DeviceNotice';

export class DeviceSearch {
  id?: number | null;
  type?: DeviceType;
  notice?: DeviceNotice;
  state?: DeviceState | null;
  deviceName?: string | null;
  vehicleName?: string | null;
  locationName?: string | null;
}
