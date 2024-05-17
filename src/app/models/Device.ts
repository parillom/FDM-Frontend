/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import {State} from './State';
import {Location} from './Location';
import {Vehicle} from './Vehicle';

export class Device {
  id?: number;
  name?: string;
  location?: Location | null;
  status?: State;
  vehicle?: Vehicle | null;
}
