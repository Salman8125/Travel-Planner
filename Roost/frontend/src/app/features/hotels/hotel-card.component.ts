import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';

import type { HotelSearchItem } from '@core/api/models';
import { StarRatingComponent } from '@shared/components/star-rating.component';
import { MoneyPipe } from '@shared/pipes/money.pipe';

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatChipsModule, StarRatingComponent, MoneyPipe],
  template: `
    <mat-card class="h-full">
      <mat-card-content class="flex flex-col gap-2">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="text-lg font-semibold leading-tight">{{ hotel().name }}</h3>
            <p class="text-sm opacity-70">{{ hotel().city }}, {{ hotel().country }}</p>
          </div>
          <app-star-rating [rating]="hotel().starRating" />
        </div>

        @if (amenities().length) {
          <mat-chip-set class="text-xs">
            @for (a of amenities(); track a) {
              <mat-chip disableRipple>{{ a }}</mat-chip>
            }
          </mat-chip-set>
        }

        <div class="mt-2 flex items-end justify-between">
          <div>
            <p class="text-xl font-bold">{{ hotel().totalPrice | money: hotel().currency }}</p>
            <p class="text-xs opacity-60">
              total · {{ hotel().pricePerNight | money: hotel().currency }} / night
            </p>
          </div>
          <a mat-flat-button color="primary" [routerLink]="['/hotels', hotel().hotelId]" [queryParams]="dateParams()">
            View
          </a>
        </div>
      </mat-card-content>
    </mat-card>
  `,
})
export class HotelCardComponent {
  readonly hotel = input.required<HotelSearchItem>();
  readonly checkInDate = input<string>();
  readonly checkOutDate = input<string>();

  readonly amenities = computed(() => (this.hotel().amenities ?? []).slice(0, 4));
  readonly dateParams = computed(() => ({
    checkInDate: this.checkInDate(),
    checkOutDate: this.checkOutDate(),
  }));
}
