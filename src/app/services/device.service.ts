import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ModelAndError} from '../models/ModelAndError';
import {CreateDevice} from '../models/CreateDevice';
import {UpdateDevice} from '../models/UpdateDevice';

const COMMON_DEVICE_URL = 'fdm/api/devices';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_DEVICE_URL}`);
  }

  create(devices: CreateDevice[]): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_DEVICE_URL}`, devices);
  }

  delete(devicesToDelete: string[]): Observable<ModelAndError> {
    const ids = devicesToDelete.filter(id => id !== undefined).join(',');
    return this.http.delete<ModelAndError>(`${COMMON_DEVICE_URL}/${ids}`);
  }

  update(request: UpdateDevice): Observable<ModelAndError> {
    return this.http.patch<ModelAndError>(`${COMMON_DEVICE_URL}`, request);
  }

  getWithUuid(uuId: number): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_DEVICE_URL}/${uuId}`);
  }

}

