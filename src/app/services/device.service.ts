import {Injectable} from '@angular/core';
import {catchError, map, Observable, retry, throwError} from 'rxjs';
import {Device} from '../models/Device';
import {HttpClient, HttpErrorResponse, HttpStatusCode} from '@angular/common/http';
import {ToastrService} from 'ngx-toastr';
import {ModelAndError} from '../models/ModelAndError';
import {isClassReferenceArray} from '@angular/compiler-cli/src/ngtsc/annotations/common';
import {ErrorHandlerService} from './error-handler.service';

const COMMON_DEVICE_URL = 'fdm/api/device';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private http: HttpClient) {
  }

  getAllDevices(): Observable<ModelAndError> {
    return this.http.get<ModelAndError>(`${COMMON_DEVICE_URL}/get-all`);
  }

  addDevice(device: Device): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_DEVICE_URL}/create`, device);
  }

  addManyDevices(devices: Device[]): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_DEVICE_URL}/create-many`, devices);
  }

  delete(device: Device): Observable<string> {
    return this.http.post<string>(`${COMMON_DEVICE_URL}/delete`, device);
  }

  deleteDevices(devicesToDelete: (number | undefined)[]): Observable<string> {
    return this.http.post<string>(`${COMMON_DEVICE_URL}/delete-many`, devicesToDelete);
  }

  updateDevice(deviceToSave: Device, deviceHasVehicle: boolean): Observable<ModelAndError> {
    return this.http.post<ModelAndError>(`${COMMON_DEVICE_URL}/update/${deviceHasVehicle}`, deviceToSave);
  }
}

