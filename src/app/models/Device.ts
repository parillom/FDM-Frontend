/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import {State} from './State';
import {Location} from './Location';
import {Vehicle} from './Vehicle';

export class Device {
  id?: number;
  uuId?: number;
  name?: string;
  location?: Location | null;
  state?: State;
  vehicle?: Vehicle | null;
}
