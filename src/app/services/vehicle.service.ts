import { Injectable } from '@angular/core';
import {Device} from '../models/Device';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Vehicle} from '../models/Vehicle';

const COMMON_VEHICLE_URL = 'fdm/api/vehicle';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor(private http: HttpClient) { }

  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${COMMON_VEHICLE_URL}/get-all`);
  }

}
