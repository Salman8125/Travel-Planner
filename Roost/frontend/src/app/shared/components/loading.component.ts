import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="flex items-center justify-center gap-3 p-10 opacity-70" role="status">
      <mat-progress-spinner mode="indeterminate" diameter="28" />
      <span>{{ label() }}</span>
    </div>
  `,
})
export class LoadingComponent {
  readonly label = input('Loading…');
}
