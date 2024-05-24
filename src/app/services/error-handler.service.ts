import { Injectable } from '@angular/core';
import {ToastrService} from 'ngx-toastr';

const SERVER_CONNECTION_FAILED = 'Verbindung zum Server fehlgeschlagen';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private toastr: ToastrService) { }

  setErrorMessage(errorMessage: string) {
    this.toastr.error(errorMessage);
  }

  noServerConnection() {
    this.setErrorMessage(SERVER_CONNECTION_FAILED);
  }
}
