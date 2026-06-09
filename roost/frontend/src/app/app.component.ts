import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService, HotelOption } from './hotel.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main style="max-width:640px;margin:2rem auto;padding:0 1rem;">
      <h1>🏨 Roost</h1>
      <p style="color:#555">Find a place to stay — talks only to its own backend at <code>{{ api }}</code></p>

      <form (ngSubmit)="search()" style="display:flex;gap:.75rem;align-items:flex-end;flex-wrap:wrap;margin:1.25rem 0;">
        <label>City<br /><input [(ngModel)]="city" name="city" placeholder="London" /></label>
        <label>Nights<br /><input [(ngModel)]="nights" name="nights" type="number" min="1" style="width:80px" /></label>
        <button type="submit" [disabled]="loading">{{ loading ? 'Searching…' : 'Search hotels' }}</button>
      </form>

      <p *ngIf="error" style="color:#b00020">Error: {{ error }}</p>

      <ul style="list-style:none;padding:0;display:grid;gap:.75rem;">
        <li *ngFor="let h of results" style="border:1px solid #ddd;border-radius:8px;padding:.75rem 1rem;">
          <strong>{{ h.name }}</strong> — {{ '★'.repeat(h.starRating) }}
          <div style="color:#666;font-size:.9rem;margin-top:4px;">
            \${{ h.pricePerNight.toFixed(2) }}/night · total <strong>\${{ h.totalPrice.toFixed(2) }}</strong>
          </div>
          <div style="color:#666;font-size:.9rem;">{{ h.amenities.join(' · ') }}</div>
        </li>
      </ul>
      <p *ngIf="!loading && !error && results.length === 0">No hotels yet — run a search.</p>
    </main>
  `,
})
export class AppComponent {
  city = 'London';
  nights = 3;
  results: HotelOption[] = [];
  error: string | null = null;
  loading = false;
  readonly api: string;

  constructor(private hotels: HotelService) {
    this.api = hotels.apiUrl;
  }

  search() {
    this.loading = true;
    this.error = null;
    this.hotels.searchHotels(this.city, this.nights).subscribe({
      next: (r) => { this.results = r; this.loading = false; },
      error: (e) => { this.error = e.message ?? 'request failed'; this.loading = false; },
    });
  }
}
