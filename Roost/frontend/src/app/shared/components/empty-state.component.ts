import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div
      class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center"
    >
      <mat-icon class="!h-10 !w-10 !text-4xl opacity-40" aria-hidden="true">{{ icon() }}</mat-icon>
      <div class="space-y-1">
        <p class="font-medium">{{ title() }}</p>
        @if (description()) {
          <p class="text-sm opacity-70">{{ description() }}</p>
        }
      </div>
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input.required<string>();
  readonly description = input<string>();
}
