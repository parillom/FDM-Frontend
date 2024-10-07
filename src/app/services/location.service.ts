import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ModelAndError} from '../models/ModelAndError';
import {Location} from '../models/Location';
import {MoveDevicesRequest} from '../models/MoveDevicesRequest';
import {CreateStorage} from '../models/CreateStorage';

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
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}/devices-from-location/${location.uuid}`);
  }

  delete(uuIds: string[]): Observable<ModelAndError> {
    const ids = uuIds.filter(id => id !== undefined).join(',');
    return this.http.delete<ModelAndError>(`${COMMON_LOCATION_URL}/${ids}`);
  }

  create(request: CreateStorage): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}`, request);
  }

  getLocation(uuId: number): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}/${uuId}`);
  }

  getLocationByName(name: string): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}/by-name/${name}`);
  }

  moveDevicesToLocation(request: MoveDevicesRequest): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}/moveDevicesToVehicle`, request);
  }

}
