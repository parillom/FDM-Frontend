import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Device} from '../../../../models/Device';
import * as XLSX from 'xlsx';
import {ToastrService} from 'ngx-toastr';
import {DeviceService} from '../../../../services/device.service';
import {ResponseHandlerService} from '../../../../services/response-handler.service';
import {DeviceState} from '../../../../models/DeviceState';
import {CreateDevice} from '../../../../models/CreateDevice';
import {StorageType} from '../../../../models/StorageType';
import {VehicleService} from '../../../../services/vehicle.service';
import {firstValueFrom} from 'rxjs';
import {LocationService} from '../../../../services/location.service';
import {DeviceType} from '../../../../models/DeviceType';
import {DeviceNotice} from '../../../../models/DeviceNotice';

@Component({
  selector: 'app-add-multiple-devices',
  templateUrl: './add-multiple-devices.component.html',
  styleUrl: './add-multiple-devices.component.scss'
})
export class AddMultipleDevicesComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  extractedElements: any[] = [];
  devices: CreateDevice[] = [];
  displayedColumns: string[] = ['Name', 'Typ', 'Bemerkung', 'Fahrzeug', 'Ort', 'Status'];
  location: string;
  vehicle: string;

  @Output()
  devicesCreated: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public dialogRef: MatDialogRef<AddMultipleDevicesComponent>,
              private toastr: ToastrService,
              private deviceService: DeviceService,
              private vehicleService: VehicleService,
              private locationService: LocationService,
              private responseHandler: ResponseHandlerService,
              private cdr: ChangeDetectorRef) {
  }

  readExcel(event: any) {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = async() => {
      const workBook = XLSX.read(fileReader.result, {type: 'binary'});
      const sheetNames = workBook.SheetNames;
      this.extractedElements = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[0]]);

      if (this.extractedElements && this.extractedElements.length > 0) {
        const newDevices: CreateDevice[] = [];

        for (const device of this.extractedElements) {
          if (this.excelIsValid(device, this.extractedElements)) {
            let storageId;
            const hasVehicle = device.vehicle && device.vehicle.trim() !== '';
            const hasLocation = device.location && device.location.trim() !== '';

            if (hasVehicle) {
              const res = await firstValueFrom(this.vehicleService.getVehicleByName(device.vehicle));
              if (res && this.responseHandler.hasError(res)) {
                this.responseHandler.setErrorMessage(res.errorMessage);
                return;
              } else {
                storageId = res.object.uuid;
                this.vehicle = res.object.name;
              }
            } else if (hasLocation) {
              const res = await firstValueFrom(this.locationService.getLocationByName(device.location));
              if (res && this.responseHandler.hasError(res)) {
                this.responseHandler.setErrorMessage(res.errorMessage);
                return;
              } else {
                storageId = res.object.uuid;
                this.location = res.object.name;
              }
            }

            const deviceToSave: CreateDevice = {
              name: device.name,
              type: device.type,
              notice: device.notice,
              storageId: storageId,
              state: device.state,
              storageType: device.vehicle ? StorageType.VEHICLE : StorageType.LOCATION
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
    const hasLocation = device.location && device.location.trim() !== '';
    const types = Object.values(DeviceType);
    const notices = Object.values(DeviceNotice);

    if (this.hasDuplicateDeviceNames(deviceList)) {
      this.toastr.error('Einige Geräte haben den selben Namen.', 'Bitte überprüfen Sie Ihre Excel-Datei.');
      return false;
    } else if (!(device.name)) {
      this.toastr.error('Nicht alle Geräte haben einen Namen.', 'Bitte überprüfen Sie Ihre Excel-Datei.');
      return false;
    } else if (!hasLocation) {
      this.toastr.error('Es muss ein Ort definiert sein', `Bitte überprüfen Sie Ihre Excel-Datei. Gerät: ${device.name}`);
      return false;
    } else if (device.location && device.state !== DeviceState.STORAGE && device.state !== DeviceState.REESTABLISH) {
      this.toastr.error('Wenn ein Ort definiert ist, muss der Status STORAGE oder REESTABLISH sein.', `Bitte überprüfen Sie Ihre Excel-Datei. Gerät ${device.name}`);
      return false;
    } else if (!types.includes(device.type)) {
      this.toastr.error('Der Typ entspricht nicht der vorgegebenen Liste', `Bitte überprüfen Sie Ihre Excel-Datei. Gerät: ${device.name}`);
      return false;
    } else if (!notices.includes(device.notice)) {
      this.toastr.error('Die Bemerkung entspricht nicht der vorgegebenen Liste', `Bitte überprüfen Sie Ihre Excel-Datei. Gerät: ${device.name}`);
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

  saveDevices() {
    this.deviceService.create(this.devices).subscribe((res) => {
      if (this.responseHandler.hasError(res)) {
        this.responseHandler.setErrorMessage(res.errorMessage!);
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
