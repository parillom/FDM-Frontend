import {Pipe, PipeTransform} from '@angular/core';
import {DeleteType} from '../../models/DeleteType';

@Pipe({
  name: 'objectType'
})
export class ObjectTypePipe implements PipeTransform {
  transform(state: DeleteType): string {
    switch (state) {
      case DeleteType.DEVICE:
        return 'GERÄTE';
      case DeleteType.VEHICLE:
        return 'FAHRZEUGE';
      case DeleteType.LOCATION:
        return 'ORTE';
    }
  }

}
