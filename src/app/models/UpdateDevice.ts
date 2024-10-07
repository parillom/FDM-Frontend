import {DeviceState} from './DeviceState';
import {StorageType} from './StorageType';

export interface UpdateDevice {
  uuid: string;
  name: string;
  storageId: string;
  state: DeviceState;
  storageType: StorageType;
}
