import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {ResponseHandlerService} from '../response-handler.service';
import {catchError, throwError} from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const responseHandler = inject(ResponseHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 500) {
        responseHandler.noServerConnection();
      }
      return throwError(() => error);
    })
  );
};
