import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '@shared/components/empty-state.component';
import { ErrorStateComponent } from '@shared/components/error-state.component';
import { LoadingComponent } from '@shared/components/loading.component';
import { PageHeaderComponent } from '@shared/components/page-header.component';
import { PaginationComponent } from '@shared/components/pagination.component';
import { DayPipe } from '@shared/pipes/day.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';

import { injectMyBookings } from './bookings.queries';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    PageHeaderComponent,
    PaginationComponent,
    LoadingComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    MoneyPipe,
    DayPipe,
  ],
  template: `
    <app-page-header title="My bookings" subtitle="Your reservations and their status." />

    @if (query.isPending()) {
      <app-loading label="Loading bookings…" />
    } @else if (query.isError()) {
      <app-error-state [error]="query.error()" (retry)="query.refetch()" />
    } @else if (query.data(); as result) {
      @if (result.data.length === 0) {
        <app-empty-state
          icon="luggage"
          title="No bookings yet"
          description="When you book a stay, it'll show up here."
        >
          <a mat-stroked-button routerLink="/" class="mt-2">Find a hotel</a>
        </app-empty-state>
      } @else {
        <div class="overflow-x-auto rounded-xl border">
          <table mat-table [dataSource]="result.data" class="w-full">
            <ng-container matColumnDef="reference">
              <th mat-header-cell *matHeaderCellDef>Reference</th>
              <td mat-cell *matCellDef="let b" class="font-mono font-medium">{{ b.reference }}</td>
            </ng-container>
            <ng-container matColumnDef="dates">
              <th mat-header-cell *matHeaderCellDef>Dates</th>
              <td mat-cell *matCellDef="let b">{{ b.checkInDate | day: 'MMM d' }} → {{ b.checkOutDate | day: 'MMM d' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let b">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" [class]="statusClass(b.status)">{{ b.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let b">{{ b.totalPrice | money: b.currency }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let b">
                <a mat-button color="primary" [routerLink]="['/bookings', b.reference]">View</a>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>

        @if (result.meta.totalPages > 1) {
          <div class="mt-4">
            <app-pagination [meta]="result.meta" (pageChange)="page.set($event)" />
          </div>
        }
      }
    }
  `,
})
export class MyBookingsComponent {
  readonly page = signal(1);
  readonly query = injectMyBookings(this.page);
  readonly columns = ['reference', 'dates', 'status', 'total', 'actions'];

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
