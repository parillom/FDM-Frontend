import {Pipe, PipeTransform} from '@angular/core';
import {UpdateType} from '../../models/UpdateType';

@Pipe({
  name: 'updateType'
})
export class UpdateTypePipe implements PipeTransform {

  transform(type: UpdateType): string {
    switch (type) {
      case UpdateType.CREATED:
        return 'Erstellung';
      case UpdateType.MOVE:
        return 'Verschiebung';
      case UpdateType.NAME_CHANGED:
        return 'Namensänderung';
      case UpdateType.STATE_CHANGED:
        return 'Statusänderung';
    }
  }

}
