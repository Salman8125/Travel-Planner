import { Pipe, PipeTransform } from '@angular/core';
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

@Pipe({ name: 'inZone', standalone: true })
export class InZonePipe implements PipeTransform {
  transform(iso: string | null | undefined, timeZone: string, fmt = 'MMM d, HH:mm zzz'): string {
    if (!iso || !timeZone) return iso ?? '';
    try {
      return formatInTimeZone(parseISO(iso), timeZone, fmt);
    } catch {
      return iso;
    }
  }
}
