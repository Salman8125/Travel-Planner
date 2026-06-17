import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { ApiError } from '@core/error/api-error';
import { EmptyStateComponent } from '@shared/components/empty-state.component';
import { ErrorStateComponent } from '@shared/components/error-state.component';
import { LoadingComponent } from '@shared/components/loading.component';
import { DayPipe } from '@shared/pipes/day.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';

import { injectCancelBooking } from './bookings.mutations';
import { injectBooking } from './bookings.queries';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    MoneyPipe,
    DayPipe,
  ],
  template: `
    <a routerLink="/bookings" class="mb-4 inline-flex items-center gap-1 text-sm opacity-70 hover:opacity-100">
      <mat-icon class="!h-4 !w-4 !text-base">arrow_back</mat-icon> My bookings
    </a>

    @if (query.isPending()) {
      <app-loading label="Loading booking…" />
    } @else if (notFound()) {
      <app-empty-state icon="search_off" title="Booking not found" description="No booking matches that reference." />
    } @else if (query.isError()) {
      <app-error-state [error]="query.error()" (retry)="query.refetch()" />
    } @else if (query.data(); as booking) {
      <mat-card>
        <mat-card-content class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p class="text-sm opacity-60">Confirmation</p>
              <p class="font-mono text-2xl font-bold tracking-widest">{{ booking.reference }}</p>
            </div>
            <span class="rounded-full px-3 py-1 text-sm font-medium" [class]="statusClass(booking.status)">
              {{ booking.status }}
            </span>
          </div>

          <dl class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div><dt class="opacity-60">Check-in</dt><dd>{{ booking.checkInDate | day }}</dd></div>
            <div><dt class="opacity-60">Check-out</dt><dd>{{ booking.checkOutDate | day }}</dd></div>
            <div><dt class="opacity-60">Rooms</dt><dd>{{ booking.numberOfRooms }}</dd></div>
            <div><dt class="opacity-60">Guests</dt><dd>{{ booking.numberOfGuests }}</dd></div>
            <div><dt class="opacity-60">Total</dt><dd class="font-semibold">{{ booking.totalPrice | money: booking.currency }}</dd></div>
            <div><dt class="opacity-60">Contact</dt><dd>{{ booking.contactEmail }}</dd></div>
          </dl>

          @if (booking.guests.length) {
            <div>
              <p class="mb-1 text-sm font-medium opacity-70">Guests</p>
              <ul class="list-inside list-disc text-sm">
                @for (g of booking.guests; track g.id) {
                  <li>{{ g.firstName }} {{ g.lastName }}</li>
                }
              </ul>
            </div>
          }

          @if (booking.status !== 'CANCELLED') {
            <div class="pt-2">
              <button
                mat-stroked-button
                color="warn"
                [disabled]="cancelMutation.isPending()"
                (click)="cancel(booking.reference)"
              >
                <mat-icon>cancel</mat-icon> Cancel booking
              </button>
            </div>
          }
        </mat-card-content>
      </mat-card>
    }
  `,
})
export class BookingDetailComponent {
  readonly reference = input.required<string>();

  readonly query = injectBooking(this.reference);
  readonly cancelMutation = injectCancelBooking();

  readonly notFound = computed(() => {
    const e = this.query.error();
    return e instanceof ApiError && e.status === 404;
  });

  cancel(reference: string): void {
    this.cancelMutation.mutate(reference);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  }
}
