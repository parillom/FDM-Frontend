import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Device} from '../models/Device';
import {HttpClient} from '@angular/common/http';

const COMMON_LOCATION_URL = 'fdm/api/location';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) { }

  getAllLocations(): Observable<Device[]> {
    return this.http.get<Device[]>(`${COMMON_LOCATION_URL}/get-all`);
  }
}
