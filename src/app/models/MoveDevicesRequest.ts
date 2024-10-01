import {DeviceState} from './DeviceState';
import {Device} from './Device';
import {Vehicle} from './Vehicle';
import {Location} from './Location';

export interface MoveDevicesRequest {
  object?: Vehicle | Location;
  objectList?: Device[];
  state: DeviceState;
  isVehicle: boolean;
}
