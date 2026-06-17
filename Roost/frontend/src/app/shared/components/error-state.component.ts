import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ApiError } from '@core/error/api-error';

@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div
      role="alert"
      class="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-300 bg-red-50 p-8 text-center"
    >
      <mat-icon class="text-red-600" aria-hidden="true">error_outline</mat-icon>
      <div class="space-y-1">
        <p class="font-medium">{{ title() }}</p>
        <p class="text-sm opacity-70">{{ message() }}</p>
      </div>
      @if (retryable()) {
        <button mat-stroked-button (click)="retry.emit()">Try again</button>
      }
    </div>
  `,
})
export class ErrorStateComponent {
  readonly error = input<unknown>();
  readonly title = input('Something went wrong');
  readonly retryable = input(true);
  readonly retry = output<void>();

  readonly message = computed(() => {
    const e = this.error();
    if (e instanceof ApiError) return e.message;
    if (e instanceof Error) return e.message;
    return 'Please try again.';
  });
}
