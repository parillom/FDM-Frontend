import { Component } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-add-multiple-devices',
  templateUrl: './add-multiple-devices.component.html',
  styleUrl: './add-multiple-devices.component.scss'
})
export class AddMultipleDevicesComponent {

  constructor(public dialogRef: MatDialogRef<AddMultipleDevicesComponent>) {
  }
  closeDialog(): void {
    this.dialogRef.close();
  }

}
