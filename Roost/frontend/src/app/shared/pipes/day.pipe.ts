import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({ name: 'day', standalone: true })
export class DayPipe implements PipeTransform {
  transform(date: string | null | undefined, fmt = 'EEE, MMM d'): string {
    if (!date) return '';
    const [y, m, d] = date.split('-').map(Number);
    if (!y || !m || !d) return date;
    return format(new Date(y, m - 1, d, 12, 0, 0), fmt);
  }
}
