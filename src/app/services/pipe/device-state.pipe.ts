/*
 * Copyright 2024 by Swiss Post, Information Technology
 */

import { Pipe, PipeTransform } from '@angular/core';
import {DeviceState} from '../../models/DeviceState';

@Pipe({
  name: 'deviceState'
})
export class DeviceStatePipe implements PipeTransform {

  transform(state: DeviceState): string {
    switch (state) {
      case DeviceState.ACTIVE:
        return 'AKTIV';
      case DeviceState.STORAGE:
        return 'LAGER';
      case DeviceState.REESTABLISH:
        return 'RETABLIEREN';
      default:
        return 'UNBEKANNT';
    }
  }

}
