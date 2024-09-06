import {Component, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Example} from '../../models/Example';

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
}
