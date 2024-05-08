import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.component.html',
  styleUrl: './add-device.component.scss'
})
export class AddDeviceComponent {

  @Output() closeModalEvent = new EventEmitter<void>();

  closeForm() {
    this.closeModalEvent.emit();
  }

}
