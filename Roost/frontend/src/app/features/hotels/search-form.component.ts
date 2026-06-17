import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { differenceInCalendarDays } from 'date-fns';

import type { HotelSearchRequest } from '@core/api/models';
import { MAX_STAY_NIGHTS } from '@core/config/app-config';
import { dateFromISO, isoFromDate, isoPlusDays, todayISO } from '@shared/utils/date';

function dateRangeValidator(maxNights: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('start')?.value as Date | null;
    const end = group.get('end')?.value as Date | null;
    if (!start || !end) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) return { past: true };
    if (differenceInCalendarDays(end, start) < 1) return { order: true };
    if (differenceInCalendarDays(end, start) > maxNights) return { maxStay: true };
    return null;
  };
}

@Component({
  selector: 'app-search-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="rounded-xl border bg-white p-4 shadow-sm">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <mat-form-field appearance="outline">
          <mat-label>City</mat-label>
          <input matInput formControlName="city" placeholder="London" />
          @if (form.controls.city.hasError('required') && form.controls.city.touched) {
            <mat-error>City is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="sm:col-span-2 lg:col-span-1">
          <mat-label>Check-in — Check-out</mat-label>
          <mat-date-range-input [rangePicker]="picker" [min]="minDate">
            <input matStartDate formControlName="start" placeholder="Check-in" />
            <input matEndDate formControlName="end" placeholder="Check-out" />
          </mat-date-range-input>
          <mat-datepicker-toggle matIconSuffix [for]="picker" />
          <mat-date-range-picker #picker />
        </mat-form-field>

        <div class="grid grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>Guests</mat-label>
            <input matInput type="number" min="1" formControlName="guests" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Rooms</mat-label>
            <input matInput type="number" min="1" formControlName="rooms" />
          </mat-form-field>
        </div>
      </div>

      <div class="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <mat-form-field appearance="outline">
          <mat-label>Min stars</mat-label>
          <mat-select formControlName="starRating">
            <mat-option [value]="null">Any</mat-option>
            @for (s of [1, 2, 3, 4, 5]; track s) {
              <mat-option [value]="s">{{ s }}+</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Min price</mat-label>
          <input matInput type="number" min="0" formControlName="priceMin" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Max price</mat-label>
          <input matInput type="number" min="0" formControlName="priceMax" />
        </mat-form-field>
        <div class="flex items-start">
          <button mat-flat-button color="primary" type="submit" class="!h-14 w-full">
            <mat-icon>search</mat-icon> Search
          </button>
        </div>
      </div>

      @if (dateError()) {
        <p class="mt-1 text-sm text-red-600">{{ dateError() }}</p>
      }
    </form>
  `,
})
export class SearchFormComponent {
  readonly initial = input<HotelSearchRequest | null>(null);
  readonly submitted = output<HotelSearchRequest>();

  private readonly fb = inject(NonNullableFormBuilder);
  readonly minDate = new Date();
  readonly maxStay = MAX_STAY_NIGHTS;

  readonly form = this.fb.group(
    {
      city: ['', Validators.required],
      start: this.fb.control<Date | null>(dateFromISO(isoPlusDays(todayISO(), 1)), Validators.required),
      end: this.fb.control<Date | null>(dateFromISO(isoPlusDays(todayISO(), 3)), Validators.required),
      guests: [2, [Validators.required, Validators.min(1)]],
      rooms: [1, [Validators.required, Validators.min(1)]],
      starRating: this.fb.control<number | null>(null),
      priceMin: this.fb.control<number | null>(null),
      priceMax: this.fb.control<number | null>(null),
    },
    { validators: dateRangeValidator(MAX_STAY_NIGHTS) },
  );

  constructor() {
    effect(() => {
      const init = this.initial();
      if (!init) return;
      this.form.patchValue(
        {
          city: init.city ?? '',
          start: init.checkInDate ? dateFromISO(init.checkInDate) : this.form.controls.start.value,
          end: init.checkOutDate ? dateFromISO(init.checkOutDate) : this.form.controls.end.value,
          guests: init.guests ?? 2,
          rooms: init.rooms ?? 1,
          starRating: init.starRating ?? null,
          priceMin: init.priceMin ?? null,
          priceMax: init.priceMax ?? null,
        },
        { emitEvent: false },
      );
    });
  }

  dateError(): string | null {
    if (!this.form.touched && !this.form.dirty) return null;
    if (this.form.hasError('past')) return "Dates can't be in the past.";
    if (this.form.hasError('order')) return 'Check-out must be after check-in.';
    if (this.form.hasError('maxStay')) return `Stays are capped at ${this.maxStay} nights.`;
    return null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitted.emit({
      city: v.city.trim(),
      checkInDate: isoFromDate(v.start as Date),
      checkOutDate: isoFromDate(v.end as Date),
      guests: v.guests,
      rooms: v.rooms,
      starRating: v.starRating ?? undefined,
      priceMin: v.priceMin ?? undefined,
      priceMax: v.priceMax ?? undefined,
    });
  }
}
