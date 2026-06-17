import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';

import type { CreateHotelRequest, HotelSearchRequest } from '@core/api/models';
import { applyApiError } from '@core/error/apply-api-error';
import { ErrorStateComponent } from '@shared/components/error-state.component';
import { LoadingComponent } from '@shared/components/loading.component';
import { PageHeaderComponent } from '@shared/components/page-header.component';
import { StarRatingComponent } from '@shared/components/star-rating.component';
import { isoPlusDays, todayISO } from '@shared/utils/date';

import { injectHotelSearch } from '../hotels/hotels.queries';
import { injectCreateHotel, injectDeleteHotel } from './admin.mutations';

@Component({
  selector: 'app-admin-hotels',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    StarRatingComponent,
    LoadingComponent,
    ErrorStateComponent,
  ],
  template: `
    <app-page-header title="Manage hotels" subtitle="Create hotels, then add room types and inventory." />

    <mat-expansion-panel class="mb-6">
      <mat-expansion-panel-header>
        <mat-panel-title><mat-icon class="mr-2">add_business</mat-icon> Create a hotel</mat-panel-title>
      </mat-expansion-panel-header>
      <form [formGroup]="form" (ngSubmit)="create()" class="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
          @if (form.controls.name.hasError('server')) { <mat-error>{{ form.controls.name.getError('server') }}</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>City</mat-label>
          <input matInput formControlName="city" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Country (ISO-2)</mat-label>
          <input matInput maxlength="2" formControlName="country" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Timezone (IANA)</mat-label>
          <input matInput formControlName="timezone" placeholder="Europe/London" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Star rating</mat-label>
          <mat-select formControlName="starRating">
            @for (s of [1, 2, 3, 4, 5]; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Address</mat-label>
          <input matInput formControlName="address" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Latitude</mat-label>
          <input matInput type="number" step="any" formControlName="latitude" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Longitude</mat-label>
          <input matInput type="number" step="any" formControlName="longitude" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="sm:col-span-2">
          <mat-label>Amenities (comma-separated)</mat-label>
          <input matInput formControlName="amenities" placeholder="WiFi, Pool, Gym" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="sm:col-span-2">
          <mat-label>Description</mat-label>
          <textarea matInput rows="2" formControlName="description"></textarea>
        </mat-form-field>
        <div class="sm:col-span-2">
          <button mat-flat-button color="primary" type="submit" [disabled]="creating()">Create hotel</button>
        </div>
      </form>
    </mat-expansion-panel>

    <div class="mb-3 flex items-end gap-3">
      <mat-form-field appearance="outline" class="w-64">
        <mat-label>Find hotels by city</mat-label>
        <input matInput [value]="city()" (input)="city.set($any($event.target).value)" placeholder="London" />
      </mat-form-field>
    </div>

    @if (criteria() === null) {
      <p class="opacity-60">Enter a city to find existing hotels to manage.</p>
    } @else if (query.isPending()) {
      <app-loading label="Searching…" />
    } @else if (query.isError()) {
      <app-error-state [error]="query.error()" (retry)="query.refetch()" />
    } @else if (query.data(); as result) {
      @if (result.data.length === 0) {
        <p class="opacity-60">No hotels with availability found for that city.</p>
      } @else {
        <ul class="flex flex-col gap-2">
          @for (hotel of result.data; track hotel.hotelId) {
            <li class="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div class="flex items-center gap-3">
                <app-star-rating [rating]="hotel.starRating" />
                <div>
                  <p class="font-medium">{{ hotel.name }}</p>
                  <p class="text-sm opacity-60">{{ hotel.city }}, {{ hotel.country }}</p>
                </div>
              </div>
              <div class="flex gap-1">
                <a mat-stroked-button [routerLink]="['/admin/hotels', hotel.hotelId]">Manage rooms</a>
                <button mat-icon-button color="warn" (click)="remove(hotel.hotelId)" aria-label="Delete hotel">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </li>
          }
        </ul>
      }
    }
  `,
})
export class AdminHotelsComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly createMutation = injectCreateHotel();
  private readonly deleteMutation = injectDeleteHotel();

  readonly creating = signal(false);
  readonly city = signal('');

  readonly criteria = computed<HotelSearchRequest | null>(() => {
    const c = this.city().trim();
    if (!c) return null;
    return {
      city: c,
      checkInDate: isoPlusDays(todayISO(), 1),
      checkOutDate: isoPlusDays(todayISO(), 3),
      guests: 1,
      pageSize: 50,
    };
  });
  readonly query = injectHotelSearch(this.criteria);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    city: ['', Validators.required],
    country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    address: [''],
    starRating: [4, [Validators.required, Validators.min(1), Validators.max(5)]],
    latitude: [0, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
    timezone: ['UTC', Validators.required],
    amenities: [''],
  });

  async create(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const body: CreateHotelRequest = {
      name: v.name.trim(),
      description: v.description || undefined,
      city: v.city.trim(),
      country: v.country.toUpperCase(),
      address: v.address || undefined,
      starRating: v.starRating,
      latitude: v.latitude,
      longitude: v.longitude,
      timezone: v.timezone.trim(),
      amenities: v.amenities ? v.amenities.split(',').map((a) => a.trim()).filter(Boolean) : undefined,
    };
    this.creating.set(true);
    try {
      const hotel = await this.createMutation.mutateAsync(body);
      await this.router.navigate(['/admin/hotels', hotel.id]);
    } catch (error) {
      applyApiError(error, this.form);
    } finally {
      this.creating.set(false);
    }
  }

  remove(id: string): void {
    this.deleteMutation.mutate(id);
  }
}
