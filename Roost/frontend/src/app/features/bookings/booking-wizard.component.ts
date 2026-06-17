import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import {
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { RouterLink } from '@angular/router';

import type { CreateBookingRequest } from '@core/api/models';
import { ApiError } from '@core/error/api-error';
import { EmptyStateComponent } from '@shared/components/empty-state.component';
import { LoadingComponent } from '@shared/components/loading.component';
import { DayPipe } from '@shared/pipes/day.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { isoFromDate, nights } from '@shared/utils/date';

import { injectHotelRooms } from '../hotels/hotels.queries';
import type { DetailDates } from '../hotels/hotels.queries';
import { injectCreateBooking } from './bookings.mutations';
import { WizardDraftStore } from './wizard-draft.store';

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MoneyPipe,
    DayPipe,
    LoadingComponent,
    EmptyStateComponent,
  ],
  template: `
    @if (!checkInDate() || !checkOutDate()) {
      <app-empty-state
        icon="event_busy"
        title="Pick your dates first"
        description="Start a booking from a hotel's room list so we know your stay dates."
      >
        <a mat-stroked-button routerLink="/" class="mt-2">Back to search</a>
      </app-empty-state>
    } @else if (roomsQuery.isPending()) {
      <app-loading label="Loading room…" />
    } @else if (!offer()) {
      <app-empty-state icon="error_outline" title="Room unavailable" description="This room can't be booked for these dates." >
        <a mat-stroked-button [routerLink]="['/hotels', hotelId()]" [queryParams]="dateParams()" class="mt-2">Back to hotel</a>
      </app-empty-state>
    } @else {
      <h1 class="mb-4 text-2xl font-bold">Book {{ offer()!.name }}</h1>

      <mat-stepper #stepper linear class="rounded-xl border bg-white">
        <mat-step [stepControl]="stayForm" label="Stay">
          <form [formGroup]="stayForm" class="flex flex-col gap-3 py-4">
            <p class="opacity-80">
              {{ checkInDate()! | day }} → {{ checkOutDate()! | day }} · {{ nightCount() }} night(s)
            </p>
            <mat-form-field appearance="outline" class="max-w-[12rem]">
              <mat-label>Rooms</mat-label>
              <input matInput type="number" min="1" [max]="offer()!.availableRooms" formControlName="rooms" />
              <mat-hint>{{ offer()!.availableRooms }} available</mat-hint>
            </mat-form-field>
            <div>
              <button mat-flat-button color="primary" matStepperNext [disabled]="stayForm.invalid">Next</button>
            </div>
          </form>
        </mat-step>

        <mat-step [stepControl]="guestsForm" label="Guests">
          <form [formGroup]="guestsForm" class="flex flex-col gap-3 py-4">
            <div formArrayName="guests" class="flex flex-col gap-4">
              @for (guest of guests.controls; track $index) {
                <div [formGroupName]="$index" class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <mat-form-field appearance="outline">
                    <mat-label>First name</mat-label>
                    <input matInput formControlName="firstName" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Last name</mat-label>
                    <input matInput formControlName="lastName" />
                  </mat-form-field>
                  <div class="flex items-center gap-1">
                    <mat-form-field appearance="outline" class="flex-1">
                      <mat-label>Date of birth</mat-label>
                      <input matInput [matDatepicker]="dp" formControlName="dateOfBirth" />
                      <mat-datepicker-toggle matIconSuffix [for]="dp" />
                      <mat-datepicker #dp />
                    </mat-form-field>
                    @if (guests.length > 1) {
                      <button mat-icon-button type="button" (click)="removeGuest($index)" aria-label="Remove guest">
                        <mat-icon>delete</mat-icon>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="flex items-center gap-3">
              <button mat-stroked-button type="button" (click)="addGuest()">
                <mat-icon>add</mat-icon> Add guest
              </button>
              @if (overCapacity()) {
                <span class="text-sm text-red-600">Max {{ maxGuests() }} guests for {{ stayForm.controls.rooms.value }} room(s)</span>
              }
            </div>

            <mat-form-field appearance="outline" class="max-w-md">
              <mat-label>Contact email</mat-label>
              <input matInput type="email" formControlName="contactEmail" />
            </mat-form-field>

            <div class="flex gap-2">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-flat-button color="primary" matStepperNext [disabled]="guestsForm.invalid || overCapacity()">Next</button>
            </div>
          </form>
        </mat-step>

        <mat-step label="Review">
          <div class="flex flex-col gap-2 py-4">
            <p><strong>{{ offer()!.name }}</strong> · sleeps {{ offer()!.capacity }}</p>
            <p>{{ checkInDate()! | day }} → {{ checkOutDate()! | day }} · {{ nightCount() }} night(s)</p>
            <p>{{ stayForm.controls.rooms.value }} room(s) · {{ guests.length }} guest(s)</p>
            <p class="text-xl font-bold">Total: {{ totalPrice() | money: offer()!.currency }}</p>
            <div class="flex gap-2">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-flat-button color="primary" matStepperNext>Continue to payment</button>
            </div>
          </div>
        </mat-step>

        <mat-step [stepControl]="paymentForm" label="Payment">
          <form [formGroup]="paymentForm" class="flex flex-col gap-3 py-4">
            <p class="text-sm opacity-70">Simulated payment — use any values. Tip: a "decline@…" contact email forces a decline.</p>
            <mat-form-field appearance="outline" class="max-w-md">
              <mat-label>Name on card</mat-label>
              <input matInput formControlName="cardName" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="max-w-md">
              <mat-label>Card number</mat-label>
              <input matInput formControlName="cardNumber" placeholder="4242424242424242" />
            </mat-form-field>
            <div class="flex gap-2">
              <button mat-button matStepperPrevious [disabled]="paying()">Back</button>
              <button mat-flat-button color="primary" type="button" (click)="pay(stepper)" [disabled]="paying() || paymentForm.invalid">
                Pay {{ totalPrice() | money: offer()!.currency }}
              </button>
            </div>
          </form>
        </mat-step>

        <mat-step label="Confirmation" [editable]="false">
          <div class="flex flex-col items-center gap-3 py-8 text-center">
            <mat-icon class="!h-12 !w-12 !text-5xl text-green-600">check_circle</mat-icon>
            <h2 class="text-xl font-bold">Booking confirmed</h2>
            <p class="opacity-80">Your confirmation code is</p>
            <p class="text-2xl font-mono font-bold tracking-widest" tabindex="0">{{ confirmedRef() }}</p>
            <div class="mt-2 flex gap-2">
              <a mat-flat-button color="primary" [routerLink]="['/bookings', confirmedRef()]">View booking</a>
              <a mat-stroked-button routerLink="/">Search more</a>
            </div>
          </div>
        </mat-step>
      </mat-stepper>
    }
  `,
})
export class BookingWizardComponent {
  readonly hotelId = input.required<string>();
  readonly roomTypeId = input.required<string>();
  readonly checkInDate = input<string>();
  readonly checkOutDate = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly draft = inject(WizardDraftStore);
  private readonly createMutation = injectCreateBooking();

  readonly paying = signal(false);
  readonly confirmedRef = signal<string | null>(null);

  private readonly dates = computed<Required<DetailDates>>(() => ({
    checkInDate: this.checkInDate() ?? '',
    checkOutDate: this.checkOutDate() ?? '',
  }));
  readonly dateParams = computed(() => ({
    checkInDate: this.checkInDate(),
    checkOutDate: this.checkOutDate(),
  }));

  readonly roomsQuery = injectHotelRooms(this.hotelId, this.dates, signal(undefined));
  readonly offer = computed(() =>
    this.roomsQuery.data()?.find((o) => o.roomTypeId === this.roomTypeId()),
  );
  readonly nightCount = computed(() =>
    this.checkInDate() && this.checkOutDate() ? nights(this.checkInDate()!, this.checkOutDate()!) : 0,
  );

  readonly stayForm = this.fb.group({
    rooms: [1, [Validators.required, Validators.min(1)]],
  });
  readonly guestsForm = this.fb.group({
    contactEmail: ['', [Validators.required, Validators.email]],
    guests: this.fb.array([this.newGuest()]),
  });
  readonly paymentForm = this.fb.group({
    cardName: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{12,19}$/)]],
  });

  get guests(): FormArray {
    return this.guestsForm.controls.guests;
  }

  readonly maxGuests = computed(() => (this.offer()?.capacity ?? 1) * this.stayForm.controls.rooms.value);
  readonly totalPrice = computed(() => (this.offer()?.totalPrice ?? 0) * this.stayForm.controls.rooms.value);

  overCapacity(): boolean {
    return this.guests.length > this.maxGuests();
  }

  private newGuest(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: this.fb.control<Date | null>(null),
    });
  }

  addGuest(): void {
    this.guests.push(this.newGuest());
  }

  removeGuest(index: number): void {
    this.guests.removeAt(index);
  }

  async pay(stepper: MatStepper): Promise<void> {
    const offer = this.offer();
    if (!offer || this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const value = this.guestsForm.getRawValue();
    const body: CreateBookingRequest = {
      roomTypeId: this.roomTypeId(),
      checkInDate: this.checkInDate()!,
      checkOutDate: this.checkOutDate()!,
      numberOfRooms: this.stayForm.controls.rooms.value,
      guests: value.guests.map((g) => ({
        firstName: g.firstName,
        lastName: g.lastName,
        dateOfBirth: g.dateOfBirth ? isoFromDate(g.dateOfBirth) : undefined,
      })),
      contactEmail: value.contactEmail,
      currency: offer.currency,
    };
    const key = this.draft.keyFor(JSON.stringify(body));
    this.paying.set(true);
    try {
      const booking = await this.createMutation.mutateAsync({ body, key });
      this.confirmedRef.set(booking.reference);
      this.draft.clear();
      void this.announcer.announce(`Booking confirmed. Reference ${booking.reference}.`);
      stepper.next();
    } catch (error) {
      this.handleError(error, stepper);
    } finally {
      this.paying.set(false);
    }
  }

  private handleError(error: unknown, stepper: MatStepper): void {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        const nightsDetail = (error.details as Record<string, string> | undefined)?.['unavailableNights'];
        const message = nightsDetail
          ? `No availability for ${nightsDetail}. Pick different dates or a different room.`
          : error.message;
        this.snackBar.open(message, 'Dismiss', { duration: 9000 });
        void this.announcer.announce(message, 'assertive');
        void this.roomsQuery.refetch();
        stepper.selectedIndex = 0;
        return;
      }
      this.snackBar.open(error.message, 'Dismiss', { duration: 6000 });
      return;
    }
    this.snackBar.open('Something went wrong. Please try again.', 'Dismiss', { duration: 6000 });
  }
}
