import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import type { PageMeta } from '@core/api/models';

@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <nav class="flex items-center justify-between gap-4" aria-label="Pagination">
      <p class="text-sm opacity-70">
        Page {{ meta().page }} of {{ meta().totalPages }} · {{ meta().total }} results
      </p>
      <div class="flex items-center gap-2">
        <button mat-stroked-button [disabled]="!canPrev()" (click)="pageChange.emit(meta().page - 1)">
          <mat-icon>chevron_left</mat-icon> Prev
        </button>
        <button mat-stroked-button [disabled]="!canNext()" (click)="pageChange.emit(meta().page + 1)">
          Next <mat-icon iconPositionEnd>chevron_right</mat-icon>
        </button>
      </div>
    </nav>
  `,
})
export class PaginationComponent {
  readonly meta = input.required<PageMeta>();
  readonly pageChange = output<number>();

  readonly canPrev = computed(() => this.meta().page > 1);
  readonly canNext = computed(() => this.meta().page < this.meta().totalPages);
}
