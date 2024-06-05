import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Device} from '../../models/Device';
import * as XLSX from 'xlsx';
import {Vehicle} from '../../models/Vehicle';
import {Location} from '../../models/Location';
import {State} from '../../models/State';
import {ToastrService} from 'ngx-toastr';
import {DeviceService} from '../../services/device.service';
import {ErrorHandlerService} from '../../services/error-handler.service';
import {DeviceState} from '../../models/DeviceState';

@Component({
  selector: 'app-add-multiple-devices',
  templateUrl: './add-multiple-devices.component.html',
  styleUrl: './add-multiple-devices.component.scss'
})
export class AddMultipleDevicesComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  extractedElements?: any[];
  devices?: Device[] = [];
  deviceNames?: string[] = [];

  @Output()
  devicesCreated: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public dialogRef: MatDialogRef<AddMultipleDevicesComponent>,
              private toastr: ToastrService,
              private deviceService: DeviceService,
              private errorHandler: ErrorHandlerService) {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  readExcel(event: any) {
    let file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = (e) => {
      let workBook = XLSX.read(fileReader.result, {type: 'binary'});
      let sheetNames = workBook.SheetNames;
      this.extractedElements = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[0]]);

      if (this.extractedElements && this.extractedElements.length > 0) {
        for (let device of this.extractedElements) {
          if (this.excelIsValid(device, this.extractedElements!)) {
            const deviceToSave = {} as Device;
            deviceToSave.location = {} as Location;
            deviceToSave.vehicle = {} as Vehicle;
            deviceToSave.state = {} as State;

            deviceToSave.name = device.name;
            deviceToSave.state.deviceState = device.state;

            if (!(device.location)) {
              deviceToSave.location = null;
              deviceToSave.vehicle!.name = device.vehicle;
            }
            if (!(device.vehicle)) {
              deviceToSave.vehicle = null;
              deviceToSave.location!.name = device.location;
            }
            this.devices?.push(deviceToSave);
          } else {
            this.resetFile();
          }
        }
      }
    }
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
    this.deviceService.addManyDevices(this.devices!).subscribe((res) => {
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
    this.readExcel(this.fileInput);
  }

  refreshFile(fileInput: HTMLInputElement) {
    this.readExcel(fileInput);
  }
}
