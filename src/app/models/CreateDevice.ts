/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import {DeviceState} from './DeviceState';
import {StorageType} from './StorageType';

export interface CreateDevice {
  name: string;
  storageId: string;
  state: DeviceState;
  storageType: StorageType
}
