/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import {DeviceState} from './DeviceState';
import {UpdateType} from './UpdateType';

export class DeviceSearch {
  id?: number | null;
  state?: DeviceState | null;
  deviceName?: string | null;
  vehicleName?: string | null;
  locationName?: string | null;
  fromDate?: Date;
  toDate?: Date;
  updateType?: UpdateType;
}
