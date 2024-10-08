/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import {Location} from './Location';
import {Vehicle} from './Vehicle';
import {DeviceState} from './DeviceState';
import {StorageType} from './StorageType';

export interface Device {
  uuId: string;
  name: string;
  location: Location | null;
  state: DeviceState;
  vehicle: Vehicle | null;
  storageType: StorageType;
}
