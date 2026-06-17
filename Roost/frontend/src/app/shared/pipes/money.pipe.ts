import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'money', standalone: true })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined, currency = 'USD'): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  }
}
