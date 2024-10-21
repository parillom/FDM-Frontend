/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import {Location} from './Location';
import {Vehicle} from './Vehicle';
import {DeviceState} from './DeviceState';
import {StorageType} from './StorageType';
import {DeviceHistory} from './DeviceHistory';
import {DeviceType} from './DeviceType';
import {DeviceNotice} from './DeviceNotice';

export interface Device {
  uuId: string;
  name: string;
  location: Location | null;
  vehicle: Vehicle | null;
  state: DeviceState;
  storageType: StorageType;
  type: DeviceType,
  notice: DeviceNotice,
  historyEntries: DeviceHistory[];
}
