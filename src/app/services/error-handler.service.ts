import { Injectable } from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {ModelAndError} from '../models/ModelAndError';
import {config, timeout} from 'rxjs';

const SERVER_CONNECTION_FAILED = 'Verbindung zum Server fehlgeschlagen';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private toastr: ToastrService) { }

  setErrorMessage(errorMessage: string) {
    this.toastr.error(errorMessage, '', {timeOut: 0});
  }

  setSuccessMessage(successMessage: string) {
    this.toastr.success(successMessage);
  }

  noServerConnection() {
    this.setErrorMessage(SERVER_CONNECTION_FAILED);
  }

  hasError(model: ModelAndError): boolean {
    return !!(!model.object && model.errorMessage);
  }
}
