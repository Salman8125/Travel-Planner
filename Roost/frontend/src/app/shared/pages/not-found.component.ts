import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <mat-icon class="!h-12 !w-12 !text-5xl opacity-40">location_off</mat-icon>
      <div class="space-y-1">
        <h1 class="text-2xl font-bold">Page not found</h1>
        <p class="opacity-70">We couldn't find that page. It may have moved or never existed.</p>
      </div>
      <a mat-flat-button color="primary" routerLink="/">Back to search</a>
    </div>
  `,
})
export class NotFoundComponent {}
