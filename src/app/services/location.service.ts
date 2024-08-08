import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Device} from '../models/Device';
import {HttpClient} from '@angular/common/http';
import {ModelAndError} from '../models/ModelAndError';
import {Vehicle} from '../models/Vehicle';
import {Location} from '../models/Location';
import {MoveDevicesRequest} from '../models/MoveDevicesRequest';

const COMMON_LOCATION_URL = 'fdm/api/location';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) { }

  getAllLocations(): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}/get-all`);
  }

  getDevicesFromLocation(location: Location): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}/get-devices-from-location`, location);
  }

  deleteLocations(locationsToDelete: (number | undefined)[]): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}/delete-many`, locationsToDelete);
  }

  delete(location: Location): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}/delete`, location);
  }

  createLocation(location: Location): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}/create`, location);
  }

  getVehicle(uuId: number): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_LOCATION_URL}/get-location/${uuId}`)
  }

  saveUpdatedDevicesOfLocation(name: string, droppedDevices: Device[], hasVehicle: boolean, selectedState: string): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}/${name}/${hasVehicle}/${selectedState}`, droppedDevices);
  }

  moveDevicesToVehicle(request: MoveDevicesRequest): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_LOCATION_URL}/moveDevicesToVehicle`, request);
  }
}
