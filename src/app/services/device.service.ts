import {Injectable} from '@angular/core';
import {catchError, map, Observable, throwError} from 'rxjs';
import {Device} from '../models/Device';
import {HttpClient, HttpStatusCode} from '@angular/common/http';

const COMMON_DEVICE_URL = 'fdm/api/device';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private http: HttpClient) { }

  getAllDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${COMMON_DEVICE_URL}/get-all`);
  }

  addDevice(device: Device): Observable<Device> {
    return this.http.post<Device>(`${COMMON_DEVICE_URL}/create`, device);
  }

  delete(device: Device): Observable<string> {
    return this.http.post<string>(`${COMMON_DEVICE_URL}/delete`, device);
  }

}
