import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <mat-icon class="!h-12 !w-12 !text-5xl text-red-600">gpp_bad</mat-icon>
      <div class="space-y-1">
        <h1 class="text-2xl font-bold">Access denied</h1>
        <p class="opacity-70">This area is for administrators only.</p>
      </div>
      <a mat-stroked-button routerLink="/">Back to search</a>
    </div>
  `,
})
export class ForbiddenComponent {}
