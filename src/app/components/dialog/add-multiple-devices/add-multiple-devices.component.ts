import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Device} from '../../../models/Device';
import * as XLSX from 'xlsx';
import {ToastrService} from 'ngx-toastr';
import {DeviceService} from '../../../services/device.service';
import {ErrorHandlerService} from '../../../services/error-handler.service';
import {DeviceState} from '../../../models/DeviceState';

@Component({
  selector: 'app-add-multiple-devices',
  templateUrl: './add-multiple-devices.component.html',
  styleUrl: './add-multiple-devices.component.scss'
})
export class AddMultipleDevicesComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  extractedElements?: any[];
  devices: Device[] = [];
  displayedColumns: string[] = ['Name', 'Fahrzeug', 'Ort', 'Status'];

  @Output()
  devicesCreated: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public dialogRef: MatDialogRef<AddMultipleDevicesComponent>,
              private toastr: ToastrService,
              private deviceService: DeviceService,
              private errorHandler: ErrorHandlerService,
              private cdr: ChangeDetectorRef) {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  readExcel(event: any) {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = () => {
      const workBook = XLSX.read(fileReader.result, {type: 'binary'});
      const sheetNames = workBook.SheetNames;
      this.extractedElements = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[0]]);

      if (this.extractedElements && this.extractedElements.length > 0) {
        const newDevices: Device[] = [];

        for (const device of this.extractedElements) {
          if (this.excelIsValid(device, this.extractedElements)) {
            const deviceToSave: Device = {
              name: device.name,
              location: device.location ? {name: device.location} : null,
              vehicle: device.vehicle ? {name: device.vehicle} : null,
              state: {deviceState: device.state}
            };
            newDevices.push(deviceToSave);
          } else {
            this.resetFile();
            return;
          }
        }
        this.devices = newDevices;
        this.cdr.detectChanges();
      }
    };
  }

  private excelIsValid(device: any, deviceList: string[]) {
    if (this.hasDuplicateDeviceNames(deviceList)) {
      this.toastr.error('Einige Geräte haben den selben Namen.', 'Bitte überprüfen Sie Ihre Excel-Datei.');
      return false;
    } else if (!(device.name)) {
      this.toastr.error('Nicht alle Geräte haben einen Namen.', 'Bitte überprüfen Sie Ihre Excel-Datei.');
      return false;
    } else if (!(device.vehicle) && !(device.location)) {
      this.toastr.error('Weder Fahrzeug noch Ort wurden definiert.', `Bitte überprüfen Sie Ihre Excel-Datei. Gerät: ${device.name}`);
      return false;
    } else if (device.vehicle && device.location) {
      this.toastr.error('Es darf nicht ein Ort und ein Fahrzeug definiert sein.', `Bitte überprüfen Sie Ihre Excel-Datei. Gerät: ${device.name}`);
      return false;
    } else if (device.vehicle && device.state !== DeviceState.ACTIVE) {
      this.toastr.error('Wenn ein Fahrzeug definiert ist, muss der Status ACTIVE sein.', `Bitte überprüfen Sie Ihre Excel-Datei. Gerät ${device.name}`);
      return false;
    } else if (device.location && device.state !== DeviceState.STORAGE && device.state !== DeviceState.REESTABLISH) {
      this.toastr.error('Wenn ein Ort definiert ist, muss der Status STORAGE oder REESTABLISH sein.', `Bitte überprüfen Sie Ihre Excel-Datei. Gerät ${device.name}`);
      return false;
    } else {
      return true;
    }
  }

  hasDuplicateDeviceNames(deviceList: any | HTMLInputElement) {
    const nameSet = new Set();
    for (const device of deviceList) {
      if (nameSet.has(device.name)) {
        return true;
      }
      nameSet.add(device.name);
    }
    return false;
  }

  addDevices() {
    this.deviceService.createDevices(this.devices!).subscribe((res) => {
      if (this.errorHandler.hasError(res)) {
        this.errorHandler.setErrorMessage(res.errorMessage!);
        this.devicesCreated.emit(false);
        this.resetFile();
      } else {
        this.toastr.success('', 'Geräte wurden erfolgreich hinzugefügt');
        this.devicesCreated.emit(true);
        this.resetFile();
      }
    });
  }

  resetFile() {
    this.fileInput.nativeElement.value = '';
    this.devices = [];
  }

  getVehicleText(device: Device): string {
    return device.vehicle ? device.vehicle.name! : 'nicht definiert';
  }

  getLocationText(device: Device): string {
    return device.location ? device.location.name! : 'nicht definiert';
  }
}
