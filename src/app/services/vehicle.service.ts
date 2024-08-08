import { Injectable } from '@angular/core';
import {Device} from '../models/Device';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Vehicle} from '../models/Vehicle';
import {ModelAndError} from '../models/ModelAndError';
import {MoveDevicesRequest} from '../models/MoveDevicesRequest';

const COMMON_VEHICLE_URL = 'fdm/api/vehicle';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor(private http: HttpClient) { }

  getAllVehicles(): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_VEHICLE_URL}/get-all`);
  }

  getDevicesFromVehicle(vehicle: Vehicle): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}/get-devices-from-vehicle`, vehicle);
  }

  deleteVehicles(vehiclesToDelete: (number | undefined)[]): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}/delete-many`, vehiclesToDelete);
  }

  delete(vehicle: Vehicle): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}/delete`, vehicle);
  }

  createVehicle(vehicle: Vehicle): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}/create`, vehicle);
  }

  getVehicle(uuId: number): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_VEHICLE_URL}/get-vehicle/${uuId}`)
  }

  saveUpdatedDevicesOfVehicle(name: string, droppedDevices: Device[], hasVehicle: boolean, selectedState: string): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}/${name}/${hasVehicle}/${selectedState}`, droppedDevices);
  }

  moveDevicesToVehicle(request: MoveDevicesRequest): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}/moveDevicesToVehicle`, request);
  }

  addManyDevices(vehicles: Vehicle[]): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}/create-many`, vehicles)

  }
}
