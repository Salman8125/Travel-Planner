import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { ApiError } from '@core/error/api-error';
import { EmptyStateComponent } from '@shared/components/empty-state.component';
import { ErrorStateComponent } from '@shared/components/error-state.component';
import { LoadingComponent } from '@shared/components/loading.component';
import { StarRatingComponent } from '@shared/components/star-rating.component';
import { MoneyPipe } from '@shared/pipes/money.pipe';

import { injectHotelDetail } from './hotels.queries';
import type { DetailDates } from './hotels.queries';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    StarRatingComponent,
    MoneyPipe,
    LoadingComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <a routerLink="/" class="mb-4 inline-flex items-center gap-1 text-sm opacity-70 hover:opacity-100">
      <mat-icon class="!h-4 !w-4 !text-base">arrow_back</mat-icon> Back to search
    </a>

    @if (query.isPending()) {
      <app-loading label="Loading hotel…" />
    } @else if (notFound()) {
      <app-empty-state icon="location_off" title="Hotel not found" description="This hotel doesn't exist or was removed." />
    } @else if (query.isError()) {
      <app-error-state [error]="query.error()" (retry)="query.refetch()" />
    } @else if (query.data(); as detail) {
      <header class="mb-6 space-y-2">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-3xl font-bold">{{ detail.hotel.name }}</h1>
          <app-star-rating [rating]="detail.hotel.starRating" />
        </div>
        <p class="opacity-70">
          {{ detail.hotel.city }}, {{ detail.hotel.country }}
          @if (detail.hotel.address) { · {{ detail.hotel.address }} }
        </p>
        @if (detail.hotel.description) {
          <p class="opacity-80">{{ detail.hotel.description }}</p>
        }
        @if (detail.hotel.amenities?.length) {
          <mat-chip-set>
            @for (a of detail.hotel.amenities; track a) {
              <mat-chip disableRipple>{{ a }}</mat-chip>
            }
          </mat-chip-set>
        }
      </header>

      <h2 class="mb-3 text-xl font-semibold">Room types</h2>

      @if (detail.availability?.length) {
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          @for (offer of detail.availability; track offer.roomTypeId) {
            <mat-card>
              <mat-card-content class="flex flex-col gap-2">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h3 class="text-lg font-semibold">{{ offer.name }}</h3>
                    <p class="text-sm opacity-70">Sleeps {{ offer.capacity }}</p>
                  </div>
                  <span class="text-sm" [class.text-red-600]="offer.availableRooms === 0">
                    {{ offer.availableRooms }} left
                  </span>
                </div>
                @if (offer.description) {
                  <p class="text-sm opacity-80">{{ offer.description }}</p>
                }
                <div class="mt-2 flex items-end justify-between">
                  <div>
                    <p class="text-xl font-bold">{{ offer.totalPrice | money: offer.currency }}</p>
                    <p class="text-xs opacity-60">total · {{ offer.pricePerNight | money: offer.currency }} / night</p>
                  </div>
                  <a
                    mat-flat-button
                    color="primary"
                    [disabled]="offer.availableRooms === 0"
                    [routerLink]="['/book', id(), offer.roomTypeId]"
                    [queryParams]="dateParams()"
                  >
                    Book
                  </a>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      } @else {
        <app-empty-state
          icon="event_busy"
          title="No availability for these dates"
          description="Pick a different date range from the search page to see bookable rooms."
        >
          @for (room of detail.roomTypes; track room.id) {
            <p class="mt-1 text-sm opacity-70">{{ room.name }} · sleeps {{ room.capacity }}</p>
          }
        </app-empty-state>
      }
    }
  `,
})
export class HotelDetailComponent {
  readonly id = input.required<string>();
  readonly checkInDate = input<string>();
  readonly checkOutDate = input<string>();

  readonly dates = computed<DetailDates>(() => ({
    checkInDate: this.checkInDate(),
    checkOutDate: this.checkOutDate(),
  }));
  readonly dateParams = computed(() => ({
    checkInDate: this.checkInDate(),
    checkOutDate: this.checkOutDate(),
  }));

  readonly query = injectHotelDetail(this.id, this.dates);

  readonly notFound = computed(() => {
    const e = this.query.error();
    return e instanceof ApiError && e.status === 404;
  });
}
