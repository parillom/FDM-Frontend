import {UpdateType} from './UpdateType';
import {StorageType} from './StorageType';
import {DeviceState} from './DeviceState';

export class DeviceHistory {
  updateType: UpdateType;
  updateDate: Date;
  storageType: StorageType;
  deviceState: DeviceState;
  storageName: string;
}
