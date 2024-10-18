import {Component, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Example} from '../../models/Example';
import {catchError, Observable, throwError} from 'rxjs';
import {CreateStorage} from '../../models/CreateStorage';
import {HttpClient} from '@angular/common/http';
import {MatDatepicker} from '@angular/material/datepicker';

const REQUIRED = 'REQUIRED';
const NAME_EQUALS = 'NAME_EQUALS';
const MAX_LENGTH = 'MAX_LENGTH';
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  @ViewChild('form') form!: NgForm;
  errors: string[] = [];
  example: Example = new Example();
  examples: Example[] = [];
  @ViewChild('picker') picker: MatDatepicker<any>;

  constructor(private http: HttpClient) {
  }

  validateLength() {
    this.errors = [];
    if (this.example.value.length > 5) {
      this.form.controls['test'].setErrors({ maxlength: true, errorKey: MAX_LENGTH});
      this.errors.push(MAX_LENGTH);
    } else if (this.example.value.length < 1) {
      this.form.controls['test'].setErrors({required: true, errorKey: REQUIRED});
      this.errors.push(REQUIRED);
    } else if (this.example.value === 'test') {
      this.form.controls['test'].setErrors({errorKey: NAME_EQUALS, nameEquals: true});
      this.errors.push(NAME_EQUALS);
    }
    if (this.form.valid) {
      this.create();
    }
  }

  private create() {
    this.examples.push(this.example);
    this.example = new Example();
  }

  //so kann man zum beispiel BadRequest vom Server behandeln. Man gibt die Response erst weiter, wenn kein error vorhanden ist
  getValue(): Observable<CreateStorage> {
    return this.http.get<CreateStorage>(`api/value/true`).pipe(
      catchError(error => {
        // new Error beinhaltet zusätzliche informationen wie stack und name
        return throwError(() => new Error('Something went wrong ', error.status));
      })
    );
  }
}
