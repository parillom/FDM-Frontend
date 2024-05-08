import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Device} from '../models/Device';
import {HttpClient} from '@angular/common/http';

const COMMON_DEVICE_URL = 'fdm/api/device'
@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private http: HttpClient) { }

  getAllDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${COMMON_DEVICE_URL}/get-all`);
  }

}
