import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(value: number): string {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    let text;
    if (hours == 0) {
      text = `${minutes}m`;
    } else {
      text = `${hours}h ${minutes}m`;
    }
    return text;
  }
}