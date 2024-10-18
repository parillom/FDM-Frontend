/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import {Location} from './Location';
import {Vehicle} from './Vehicle';
import {DeviceState} from './DeviceState';
import {StorageType} from './StorageType';
import {UpdateType} from './UpdateType';

export interface Device {
  uuId: string;
  name: string;
  location: Location | null;
  vehicle: Vehicle | null;
  state: DeviceState;
  storageType: StorageType;
  creationDate: Date;
  lastUpdate: Date;
  updateType: UpdateType;
}
