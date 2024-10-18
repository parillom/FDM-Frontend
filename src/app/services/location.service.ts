import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ModelAndError} from '../models/ModelAndError';
import {Location} from '../models/Location';
import {MoveDevicesRequest} from '../models/MoveDevicesRequest';
import {CreateStorage} from '../models/CreateStorage';
import {Storage} from '../models/Storage';

const COMMON_LOCATION_URL = 'fdm/api/locations';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}`);
  }

  getDevicesFromLocation(location: Location): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}/devices-from-vehicle/${location.uuid}`);
  }

  delete(uuIds: string[]): Observable<ModelAndError> {
    const ids = uuIds.filter(id => id !== undefined).join(',');
    return this.http.delete<ModelAndError>(`${COMMON_LOCATION_URL}/${ids}`);
  }

  create(requests: CreateStorage[]): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}`, requests);
  }

  update(request: Storage): Observable<ModelAndError> {
    return this.http.patch<ModelAndError>(`${COMMON_LOCATION_URL}`, request);
  }

  getLocationByName(name: string): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}/by-name/${name}`);
  }

  getLocationByUuId(uuid: string): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}/${uuid}`);
  }

  moveDevices(request: MoveDevicesRequest): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}/moveDevices`, request);
  }

  deleteAll(): Observable<ModelAndError> {
    return this.http.delete<ModelAndError>(`${COMMON_LOCATION_URL}/all`);
  }
}
