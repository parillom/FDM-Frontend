import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Vehicle} from '../models/Vehicle';
import {ModelAndError} from '../models/ModelAndError';
import {MoveDevicesRequest} from '../models/MoveDevicesRequest';
import {CreateStorage} from '../models/CreateStorage';
import {Storage} from '../models/Storage';

const COMMON_VEHICLE_URL = 'fdm/api/vehicles';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_VEHICLE_URL}`);
  }

  getDevicesFromVehicle(vehicle: Vehicle): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_VEHICLE_URL}/devices-from-vehicle/${vehicle.uuid}`);
  }

  delete(uuIds: string[]): Observable<ModelAndError> {
    const ids = uuIds.filter(id => id !== undefined).join(',');
    return this.http.delete<ModelAndError>(`${COMMON_VEHICLE_URL}/${ids}`);
  }

  create(requests: CreateStorage[]): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}`, requests);
  }

  update(request: Storage): Observable<ModelAndError> {
    return this.http.patch<ModelAndError>(`${COMMON_VEHICLE_URL}`, request);
  }

  getVehicleByName(name: string): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_VEHICLE_URL}/by-name/${name}`);
  }

  getVehicleByUuId(uuid: number): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_VEHICLE_URL}/${uuid}`);
  }

  moveDevices(request: MoveDevicesRequest): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_VEHICLE_URL}/moveDevices`, request);
  }

}
