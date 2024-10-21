/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import {DeviceState} from './DeviceState';
import {StorageType} from './StorageType';
import {DeviceType} from './DeviceType';
import {DeviceNotice} from './DeviceNotice';

export interface CreateDevice {
  name: string;
  type: DeviceType,
  notice: DeviceNotice,
  storageId: string;
  state: DeviceState;
  storageType: StorageType
}
