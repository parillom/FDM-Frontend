import {Pipe, PipeTransform} from '@angular/core';
import {EntityType} from '../../models/EntityType';

@Pipe({
  name: 'objectType'
})
export class EntityTypePipe implements PipeTransform {
  transform(state: EntityType): string {
    switch (state) {
      case EntityType.DEVICE:
        return 'GERÄTE';
      case EntityType.VEHICLE:
        return 'FAHRZEUGE';
      case EntityType.LOCATION:
        return 'ORTE';
    }
  }

}
