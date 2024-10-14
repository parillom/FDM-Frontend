import { Injectable } from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {ModelAndError} from '../models/ModelAndError';

const SERVER_CONNECTION_FAILED = 'Verbindung zum Server fehlgeschlagen';

@Injectable({
  providedIn: 'root'
})
export class ResponseHandlerService {

  constructor(private toastr: ToastrService) { }

  setErrorMessage(errorMessage: string) {
    this.toastr.error(errorMessage);
  }

  setSuccessMessage(successMessage: string) {
    this.toastr.success(successMessage);
  }

  setWarningMessage(warningMessage: string) {
    this.toastr.warning(warningMessage);
  }

  noServerConnection() {
    this.setErrorMessage(SERVER_CONNECTION_FAILED);
  }

  hasError(model: ModelAndError): boolean {
    return !!(!model.object && model.errorMessage);
  }
}
