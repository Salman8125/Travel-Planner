import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';

import type { HotelSearchRequest } from '@core/api/models';
import { EmptyStateComponent } from '@shared/components/empty-state.component';
import { ErrorStateComponent } from '@shared/components/error-state.component';
import { LoadingComponent } from '@shared/components/loading.component';
import { PageHeaderComponent } from '@shared/components/page-header.component';
import { PaginationComponent } from '@shared/components/pagination.component';

import { HotelCardComponent } from './hotel-card.component';
import { injectHotelSearch } from './hotels.queries';
import { SearchFormComponent } from './search-form.component';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-search-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SearchFormComponent,
    HotelCardComponent,
    PaginationComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingComponent,
  ],
  template: `
    <app-page-header
      title="Find a place to stay"
      subtitle="Search hotels by city and dates — no account needed."
    />

    <app-search-form [initial]="criteria()" (submitted)="onSearch($event)" />

    <div class="mt-6">
      @if (criteria() === null) {
        <app-empty-state
          icon="travel_explore"
          title="Search for hotels"
          description="Enter a city and your dates to see availability and pricing."
        />
      } @else if (query.isPending()) {
        <app-loading label="Searching hotels…" />
      } @else if (query.isError()) {
        <app-error-state [error]="query.error()" (retry)="query.refetch()" />
      } @else if (query.data(); as result) {
        @if (result.data.length === 0) {
          <app-empty-state
            icon="search_off"
            title="No hotels match your search"
            description="Try different dates, fewer filters, or another city."
          />
        } @else {
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (hotel of result.data; track hotel.hotelId) {
              <app-hotel-card
                [hotel]="hotel"
                [checkInDate]="criteria()!.checkInDate"
                [checkOutDate]="criteria()!.checkOutDate"
              />
            }
          </div>
          @if (result.meta.totalPages > 1) {
            <div class="mt-6">
              <app-pagination [meta]="result.meta" (pageChange)="goToPage($event)" />
            </div>
          }
        }
      }
    </div>
  `,
})
export class SearchPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });

  readonly criteria = computed<HotelSearchRequest | null>(() => {
    const p = this.params();
    const city = p.get('city');
    const checkInDate = p.get('checkInDate');
    const checkOutDate = p.get('checkOutDate');
    if (!city || !checkInDate || !checkOutDate) return null;
    return {
      city,
      checkInDate,
      checkOutDate,
      guests: Number(p.get('guests')) || 2,
      rooms: Number(p.get('rooms')) || 1,
      starRating: p.get('starRating') ? Number(p.get('starRating')) : undefined,
      priceMin: p.get('priceMin') ? Number(p.get('priceMin')) : undefined,
      priceMax: p.get('priceMax') ? Number(p.get('priceMax')) : undefined,
      page: Number(p.get('page')) || 1,
      pageSize: PAGE_SIZE,
    };
  });

  readonly query = injectHotelSearch(this.criteria);

  onSearch(criteria: HotelSearchRequest): void {
    void this.router.navigate(['/'], { queryParams: this.toQuery(criteria, 1) });
  }

  goToPage(page: number): void {
    const current = this.criteria();
    if (current) {
      void this.router.navigate(['/'], { queryParams: this.toQuery(current, page) });
    }
  }

  private toQuery(c: HotelSearchRequest, page: number): Params {
    const params: Params = {
      city: c.city,
      checkInDate: c.checkInDate,
      checkOutDate: c.checkOutDate,
      guests: c.guests,
      rooms: c.rooms,
      page,
    };
    if (c.starRating) params['starRating'] = c.starRating;
    if (c.priceMin != null) params['priceMin'] = c.priceMin;
    if (c.priceMax != null) params['priceMax'] = c.priceMax;
    return params;
  }
}
