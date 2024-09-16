import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightSearchText'
})
export class HighlightSearchTextPipe implements PipeTransform {

  transform(value: any, args: any): any {
    if (!args || typeof value !== 'string') {
      return value;
    }

    const regex = new RegExp(args, 'gi');
    const match = value.match(regex);

    if (!match) {
      return value;
    }

    return value.replace(regex, `<span class='highlight'>${match[0]}</span>`);
  }

}
