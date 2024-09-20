import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Device} from '../models/Device';
import {HttpClient} from '@angular/common/http';
import {ModelAndError} from '../models/ModelAndError';

const COMMON_DEVICE_URL = 'fdm/api/devices';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private http: HttpClient) {
  }

  getAllDevices(): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_DEVICE_URL}`);
  }

  createDevice(device: Device): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_DEVICE_URL}`, device);
  }

  createDevices(devices: Device[]): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_DEVICE_URL}/many`, devices);
  }

  deleteDevice(device: Device): Observable<ModelAndError> {
    return this.http.delete<ModelAndError>(`${COMMON_DEVICE_URL}/${device.uuId}`);
  }

  deleteDevices(devicesToDelete: (number | undefined)[]): Observable<ModelAndError> {
    const ids = devicesToDelete.filter(id => id !== undefined).join(',');
    return this.http.delete<ModelAndError>(`${COMMON_DEVICE_URL}/many/${ids}`);
  }

  updateDevice(deviceToSave: Device): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_DEVICE_URL}`, deviceToSave);
  }

  getDeviceWithUuId(uuId: number): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_DEVICE_URL}/${uuId}`);
  }
}

