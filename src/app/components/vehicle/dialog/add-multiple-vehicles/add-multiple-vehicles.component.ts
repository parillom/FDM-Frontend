import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ToastrService} from 'ngx-toastr';
import {ErrorHandlerService} from '../../../../services/error-handler.service';
import * as XLSX from 'xlsx';
import {Vehicle} from '../../../../models/Vehicle';
import {VehicleService} from '../../../../services/vehicle.service';

@Component({
  selector: 'app-add-multiple-vehicles',
  templateUrl: './add-multiple-vehicles.component.html',
  styleUrl: './add-multiple-vehicles.component.scss'
})
export class AddMultipleVehiclesComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  extractedElements?: any[];
  vehicles: Vehicle[] = [];
  displayedColumns: string[] = ['Name'];

  @Output()
  vehiclesCreated: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public dialogRef: MatDialogRef<AddMultipleVehiclesComponent>,
              private toastr: ToastrService,
              private vehicleService: VehicleService,
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
        const newVehicles: Vehicle[] = [];

        for (const vehicle of this.extractedElements) {
          if (this.excelIsValid(vehicle, this.extractedElements)) {
            const vehicleToSave: Vehicle = {
              name: vehicle.name,
            };
            newVehicles.push(vehicleToSave);
          } else {
            this.resetFile();
            return;
          }
        }
        this.vehicles = newVehicles;
        this.cdr.detectChanges();
      }
    };
  }

  private excelIsValid(vehicle: any, vehicleList: string[]) {
    if (this.hasDuplicateDeviceNames(vehicleList)) {
      this.toastr.error('Einige Fahrzeuge haben den selben Namen.', 'Bitte überprüfen Sie Ihre Excel-Datei.');
      return false;
    } else if (!vehicle.name) {
      this.toastr.error('Nicht alle Geräte haben einen Namen.', 'Bitte überprüfen Sie Ihre Excel-Datei.');
      return false;
    } else {
      return true;
    }
  }

  hasDuplicateDeviceNames(vehicleList: any | HTMLInputElement) {
    const nameSet = new Set();
    for (const vehicle of vehicleList) {
      if (nameSet.has(vehicle.name)) {
        return true;
      }
      nameSet.add(vehicle.name);
    }
    return false;
  }

  addVehicles() {
    this.vehicleService.saveMany(this.vehicles!).subscribe((res) => {
      if (this.errorHandler.hasError(res)) {
        this.errorHandler.setErrorMessage(res.errorMessage!);
        this.vehiclesCreated.emit(false);
        this.resetFile();
      } else {
        this.toastr.success('', 'Fahrzeuge wurden erfolgreich hinzugefügt');
        this.vehiclesCreated.emit(true);
        this.resetFile();
      }
    });
  }

  resetFile() {
    this.fileInput.nativeElement.value = '';
    this.vehicles = [];
  }

}
