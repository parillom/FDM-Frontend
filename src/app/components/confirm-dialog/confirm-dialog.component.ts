import {Component, EventEmitter, Output} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {

  constructor(private dialogRef: MatDialogRef<ConfirmDialogComponent>) {
  }

  @Output()
  confirm: EventEmitter<boolean> = new EventEmitter<boolean>();

  closeDialog() {
    this.dialogRef.close();
  }

  confirmHandle() {
    this.confirm.emit(true);
    this.dialogRef.close();
  }
}
