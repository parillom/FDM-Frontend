/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import {State} from './State';
import {Location} from './Location';

export class Device {
  id?: number;
  name?: string;
  location?: Location;
  status?: State;
}
