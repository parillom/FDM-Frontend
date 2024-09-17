/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import {Location} from './Location';
import {Vehicle} from './Vehicle';
import {DeviceState} from './DeviceState';

export class Device {
  id: number;
  uuId: number;
  name: string;
  location: Location | null;
  state: DeviceState;
  vehicle: Vehicle | null;
}
