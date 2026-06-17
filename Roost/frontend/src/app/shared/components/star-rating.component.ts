import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <span class="inline-flex items-center" [attr.aria-label]="rating() + '-star hotel'">
      @for (filled of stars(); track $index) {
        <mat-icon class="!h-4 !w-4 !text-base text-amber-500" aria-hidden="true">
          {{ filled ? 'star' : 'star_border' }}
        </mat-icon>
      }
    </span>
  `,
})
export class StarRatingComponent {
  readonly rating = input.required<number>();
  readonly stars = computed(() => Array.from({ length: 5 }, (_, i) => i < this.rating()));
}
