import {Injectable} from '@angular/core';
import * as XLSX from 'xlsx';
import {Device} from '../models/Device';
import {ErrorHandlerService} from './error-handler.service';
import autoTable from 'jspdf-autotable';
import {DeviceState} from '../models/DeviceState';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  data: (number | string | string)[][] = [];
  headers: string[][] = [];

  constructor(private errorHandler: ErrorHandlerService) {
  }

  //Excel
  exportExcel(data: Device[]) {
    const exportData = data.map((item: any) => ({
      ID: item.uuId,
      Name: item.name,
      Ort: item.location?.name || '-',
      Fahrzeug: item.vehicle?.name || '-',
      Status: this.getDeviceState(item.state?.deviceState),
    }));

    const workSheet = XLSX.utils.json_to_sheet(exportData, {header: ['ID', 'Name', 'Ort', 'Fahrzeug', 'Status']});

    const wscols = [
      {width: 40},
      {width: 20},
      {width: 10},
      {width: 10},
      {width: 20},
    ];

    workSheet['!cols'] = wscols;
    workSheet['!rows'] = [{hpt: 30}, {hpt: 30}]

    const workBook: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');

    XLSX.writeFile(workBook, 'devices.xlsx');
  }

  //PDF
  exportPfd(devices: Device[]) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Geräte', 10, 10);
    doc.setFontSize(12);
    doc.text(
      `Anzahl: ${devices.length}`,
      10,
      20,
    );

    //setting header
    if (this.hasLocations(devices) && this.hasVehicles(devices)) {
      this.headers = [['ID', 'Name', 'Ort', 'Fahrzeug', 'Status']];
    } else if (this.hasLocations(devices) && !this.hasVehicles(devices)) {
      this.headers = [['ID', 'Name', 'Ort', 'Status']];
    } else if (this.hasVehicles(devices) && !this.hasLocations(devices)) {
      this.headers = [['ID', 'Name', 'Fahrzeug', 'Status']];
    }

    //setting body
    if (this.hasLocations(devices) && this.hasVehicles(devices)) {
      this.data = devices.map(device => [
        device.uuId || 'Unbekannt',
        device.name || 'Unbekannt',
        device.location?.name || '-',
        device.vehicle?.name || '-',
        this.getDeviceState(device.state?.deviceState) || 'Unbekannt'
      ]);
    } else if (this.hasLocations(devices) && !this.hasVehicles(devices)) {
      this.data = devices.map(device => [
        device.uuId || 'Unbekannt',
        device.name || 'Unbekannt',
        device.location?.name || '-',
        this.getDeviceState(device.state?.deviceState) || 'Unbekannt'
      ]);
    } else if (!this.hasLocations(devices) && this.hasVehicles(devices)) {
      this.data = devices.map(device => [
        device.uuId || 'Unbekannt',
        device.name || 'Unbekannt',
        device.vehicle?.name || '-',
        this.getDeviceState(device.state?.deviceState) || 'Unbekannt'
      ]);
    }

    autoTable(doc, {
      head: this.headers,
      body: this.data,
      startY: 30,
      pageBreak: 'auto',
      theme: 'striped',
      margin: {left: 10, right: 10},
    });

    doc.save('devices.pdf');
  }

  getDeviceState(deviceState: DeviceState | undefined): string | undefined {
    let state: string | undefined;
    switch (deviceState) {
      case DeviceState.ACTIVE:
        state = 'AKTIV';
        break;
      case DeviceState.STORAGE:
        state = 'LAGER';
        break;
      case DeviceState.REESTABLISH:
        state = 'RETABLIEREN';
        break;
      default:
        state = undefined;
    }
    return state;
  }

  hasLocations(devices: Device[]) {
    return devices.some(device => device.location !== null && device.location !== undefined);
  }

  hasVehicles(devices: Device[]) {
    return devices.some(device => device.vehicle !== null && device.vehicle !== undefined);
  }
}
