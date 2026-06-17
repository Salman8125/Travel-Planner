import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';

import type { AvailabilityUpsertRequest, CreateRoomTypeRequest } from '@core/api/models';
import { applyApiError } from '@core/error/apply-api-error';
import { ErrorStateComponent } from '@shared/components/error-state.component';
import { LoadingComponent } from '@shared/components/loading.component';
import { PageHeaderComponent } from '@shared/components/page-header.component';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { isoPlusDays, todayISO } from '@shared/utils/date';

import { injectHotelDetail, type DetailDates } from '../hotels/hotels.queries';
import {
  injectCreateRoomType,
  injectDeleteRoomType,
  injectUpsertAvailability,
} from './admin.mutations';

@Component({
  selector: 'app-admin-hotel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    PageHeaderComponent,
    LoadingComponent,
    ErrorStateComponent,
    MoneyPipe,
  ],
  template: `
    <a routerLink="/admin/hotels" class="mb-3 inline-flex items-center gap-1 text-sm">
      <mat-icon class="!h-5 !w-5 !text-lg">arrow_back</mat-icon> All hotels
    </a>

    @if (query.isPending()) {
      <app-loading label="Loading hotel…" />
    } @else if (query.isError()) {
      <app-error-state [error]="query.error()" (retry)="query.refetch()" />
    } @else if (query.data(); as detail) {
      <app-page-header [title]="detail.hotel.name" [subtitle]="detail.hotel.city + ', ' + detail.hotel.country" />

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">Room types</h2>
        @if (detail.roomTypes.length === 0) {
          <p class="opacity-60">No room types yet. Add one below.</p>
        } @else {
          <ul class="flex flex-col gap-2">
            @for (rt of detail.roomTypes; track rt.id) {
              <li class="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div>
                  <p class="font-medium">{{ rt.name }}</p>
                  <p class="text-sm opacity-60">
                    Sleeps {{ rt.capacity }} · {{ rt.basePricePerNight | money: rt.currency }}/night
                  </p>
                </div>
                <button mat-icon-button color="warn" (click)="removeRoom(rt.id)" aria-label="Delete room type">
                  <mat-icon>delete</mat-icon>
                </button>
              </li>
            }
          </ul>
        }
      </section>

      <mat-divider class="!mb-6" />

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold">Add a room type</h2>
        <form [formGroup]="roomForm" (ngSubmit)="addRoom()" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" />
            @if (roomForm.controls.name.hasError('server')) {
              <mat-error>{{ roomForm.controls.name.getError('server') }}</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Capacity</mat-label>
            <input matInput type="number" min="1" formControlName="capacity" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Base price / night</mat-label>
            <input matInput type="number" step="any" min="0" formControlName="basePricePerNight" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Currency (ISO-3)</mat-label>
            <input matInput maxlength="3" formControlName="currency" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="sm:col-span-2">
            <mat-label>Amenities (comma-separated)</mat-label>
            <input matInput formControlName="amenities" placeholder="Balcony, Sea view" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="sm:col-span-2">
            <mat-label>Description</mat-label>
            <textarea matInput rows="2" formControlName="description"></textarea>
          </mat-form-field>
          <div class="sm:col-span-2">
            <button mat-flat-button color="primary" type="submit" [disabled]="savingRoom()">Add room type</button>
          </div>
        </form>
      </section>

      <mat-divider class="!mb-6" />

      <section>
        <h2 class="mb-3 text-lg font-semibold">Set nightly availability</h2>
        @if (detail.roomTypes.length === 0) {
          <p class="opacity-60">Add a room type first.</p>
        } @else {
          <form [formGroup]="availForm" (ngSubmit)="saveAvailability()" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <mat-form-field appearance="outline" class="sm:col-span-2">
              <mat-label>Room type</mat-label>
              <mat-select formControlName="roomTypeId">
                @for (rt of detail.roomTypes; track rt.id) {
                  <mat-option [value]="rt.id">{{ rt.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Start date</mat-label>
              <input matInput type="date" formControlName="startDate" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>End date</mat-label>
              <input matInput type="date" formControlName="endDate" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Total rooms</mat-label>
              <input matInput type="number" min="0" formControlName="totalRooms" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Available rooms (optional)</mat-label>
              <input matInput type="number" min="0" formControlName="availableRooms" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="sm:col-span-2">
              <mat-label>Price override (optional)</mat-label>
              <input matInput type="number" step="any" min="0" formControlName="priceOverride" />
            </mat-form-field>
            <div class="sm:col-span-2">
              <button mat-flat-button color="primary" type="submit" [disabled]="savingAvail()">Save availability</button>
            </div>
          </form>
        }
      </section>
    }
  `,
})
export class AdminHotelComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly createRoom = injectCreateRoomType();
  private readonly deleteRoomMutation = injectDeleteRoomType();
  private readonly upsertAvail = injectUpsertAvailability();

  readonly id = input.required<string>();
  private readonly noDates = signal<DetailDates>({});
  readonly query = injectHotelDetail(computed(() => this.id()), this.noDates);

  readonly savingRoom = signal(false);
  readonly savingAvail = signal(false);

  readonly roomForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    capacity: [2, [Validators.required, Validators.min(1)]],
    basePricePerNight: [100, [Validators.required, Validators.min(0)]],
    currency: ['USD', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    amenities: [''],
  });

  readonly availForm = this.fb.group({
    roomTypeId: ['', Validators.required],
    startDate: [isoPlusDays(todayISO(), 1), Validators.required],
    endDate: [isoPlusDays(todayISO(), 8), Validators.required],
    totalRooms: [5, [Validators.required, Validators.min(0)]],
    availableRooms: [null as number | null],
    priceOverride: [null as number | null],
  });

  async addRoom(): Promise<void> {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }
    const v = this.roomForm.getRawValue();
    const body: CreateRoomTypeRequest = {
      name: v.name.trim(),
      description: v.description || undefined,
      capacity: v.capacity,
      basePricePerNight: v.basePricePerNight,
      currency: v.currency.toUpperCase(),
      amenities: v.amenities ? v.amenities.split(',').map((a) => a.trim()).filter(Boolean) : undefined,
    };
    this.savingRoom.set(true);
    try {
      await this.createRoom.mutateAsync({ hotelId: this.id(), body });
      this.roomForm.reset({
        name: '',
        description: '',
        capacity: 2,
        basePricePerNight: 100,
        currency: 'USD',
        amenities: '',
      });
    } catch (error) {
      applyApiError(error, this.roomForm);
    } finally {
      this.savingRoom.set(false);
    }
  }

  removeRoom(id: string): void {
    this.deleteRoomMutation.mutate(id);
  }

  async saveAvailability(): Promise<void> {
    if (this.availForm.invalid) {
      this.availForm.markAllAsTouched();
      return;
    }
    const v = this.availForm.getRawValue();
    const body: AvailabilityUpsertRequest = {
      startDate: v.startDate,
      endDate: v.endDate,
      totalRooms: v.totalRooms,
      availableRooms: v.availableRooms ?? undefined,
      priceOverride: v.priceOverride ?? undefined,
    };
    this.savingAvail.set(true);
    try {
      await this.upsertAvail.mutateAsync({ roomTypeId: v.roomTypeId, body });
    } catch (error) {
      applyApiError(error, this.availForm);
    } finally {
      this.savingAvail.set(false);
    }
  }
}
