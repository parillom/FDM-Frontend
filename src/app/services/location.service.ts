import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Device} from '../models/Device';
import {HttpClient} from '@angular/common/http';
import {ModelAndError} from '../models/ModelAndError';
import {Location} from '../models/Location';
import {MoveDevicesRequest} from '../models/MoveDevicesRequest';

const COMMON_LOCATION_URL = 'fdm/api/locations';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) { }

  getAllLocations(): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}`);
  }

  getDevicesFromLocation(location: Location): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}/devices-from-location/${location.uuId}`);
  }

  deleteLocations(locationsToDelete: (number | undefined)[]): Observable<ModelAndError> {
    const ids = locationsToDelete.filter(id => id !== undefined).join(',');
    return this.http.delete<ModelAndError>(`${COMMON_LOCATION_URL}/many/${ids}`);
  }

  delete(location: Location): Observable<ModelAndError> {
    return this.http.delete<ModelAndError>(`${COMMON_LOCATION_URL}/${location.uuId}`);
  }

  createLocation(location: Location): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}`, location);
  }

  getLocation(uuId: number): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}/${uuId}`)
  }

  saveUpdatedDevicesOfLocation(name: string, droppedDevices: Device[], hasVehicle: boolean, selectedState: string): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}/${name}/${hasVehicle}/${selectedState}`, droppedDevices);
  }

  moveDevicesToLocation(request: MoveDevicesRequest): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}/moveDevicesToVehicle`, request);
  }
}
