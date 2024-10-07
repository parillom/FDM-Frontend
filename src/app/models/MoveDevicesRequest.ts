import {DeviceState} from './DeviceState';
import {StorageType} from './StorageType';

export interface MoveDevicesRequest {
  storageId: string;
  deviceList: string[];
  state: DeviceState;
  storageType: StorageType;
}
