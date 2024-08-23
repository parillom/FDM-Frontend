import { Injectable } from '@angular/core';
import {Device} from '../models/Device';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Vehicle} from '../models/Vehicle';
import {ModelAndError} from '../models/ModelAndError';
import {MoveDevicesRequest} from '../models/MoveDevicesRequest';

const COMMON_VEHICLE_URL = 'fdm/api/vehicles';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor(private http: HttpClient) { }

  getAllVehicles(): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_VEHICLE_URL}`);
  }

  getDevicesFromVehicle(vehicle: Vehicle): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_VEHICLE_URL}/devices-from-vehicle/${vehicle.uuId}`);
  }

  deleteVehicles(vehiclesToDelete: (number | undefined)[]): Observable<ModelAndError> {
    const ids = vehiclesToDelete.filter(id => id !== undefined).join(',');
    return this.http.delete<ModelAndError>(`${COMMON_VEHICLE_URL}/many/${ids}`);
  }

  deleteVehicle(vehicle: Vehicle): Observable<ModelAndError> {
    return this.http.delete<ModelAndError>(`${COMMON_VEHICLE_URL}/${vehicle.uuId}`);
  }

  createVehicle(vehicle: Vehicle): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}`, vehicle);
  }

  getVehicle(uuId: number): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_VEHICLE_URL}/${uuId}`)
  }

  saveUpdatedDevicesOfVehicle(name: string, droppedDevices: Device[], hasVehicle: boolean, selectedState: string): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}/${name}/${hasVehicle}/${selectedState}`, droppedDevices);
  }

  moveDevicesToVehicle(request: MoveDevicesRequest): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}/moveDevicesToVehicle`, request);
  }

  createVehicles(vehicles: Vehicle[]): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}/many`, vehicles)
  }

  updateVehicleName(uuId: number | undefined, newVehicleName: string): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_VEHICLE_URL}/updateVehicleName/${uuId}/${newVehicleName}`)
  }
}
