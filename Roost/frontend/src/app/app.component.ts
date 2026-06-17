import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { injectQueryClient } from '@tanstack/angular-query-experimental';

import { setErrorNotifier, setSuccessNotifier } from '@core/api/notifier';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-toolbar color="primary" class="!sticky top-0 z-30 gap-2">
      <a routerLink="/" class="flex items-center gap-2 font-semibold text-inherit no-underline">
        <mat-icon>hotel</mat-icon>
        <span>Roost</span>
      </a>
      <span class="flex-1"></span>
      <nav class="flex items-center gap-1">
        <a mat-button routerLink="/" routerLinkActive="!font-bold" [routerLinkActiveOptions]="{ exact: true }">
          Search
        </a>
        @if (auth.isAuthenticated()) {
          <a mat-button routerLink="/bookings" routerLinkActive="!font-bold">My bookings</a>
        }
        @if (auth.isAdmin()) {
          <a mat-button routerLink="/admin" routerLinkActive="!font-bold">Admin</a>
        }
        @if (auth.isAuthenticated()) {
          <span class="mx-2 hidden text-sm opacity-90 sm:inline">{{ auth.user()?.email }}</span>
          <button mat-button (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span class="hidden sm:inline">Sign out</span>
          </button>
        } @else {
          <a mat-stroked-button routerLink="/login">Sign in</a>
        }
      </nav>
    </mat-toolbar>

    <main class="container py-6">
      <router-outlet />
    </main>
  `,
})
export class AppComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly queryClient = injectQueryClient();
  readonly auth = inject(AuthStore);

  constructor() {
    setErrorNotifier((message) => this.snackBar.open(message, 'Dismiss', { duration: 6000 }));
    setSuccessNotifier((message) => this.snackBar.open(message, 'OK', { duration: 3000 }));
  }

  ngOnInit(): void {
    void this.auth.ensureSession();
  }

  logout(): void {
    this.auth.clearSession();
    this.queryClient.clear();
    void this.router.navigate(['/']);
  }
}
