import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { applyApiError } from '@core/error/apply-api-error';

import { injectLogin, injectRegister } from './auth.mutations';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="mx-auto max-w-md py-8">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ mode() === 'login' ? 'Welcome back' : 'Create your account' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="mt-4 flex flex-col gap-2">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              @if (form.controls.email.hasError('required') && form.controls.email.touched) {
                <mat-error>Email is required</mat-error>
              } @else if (form.controls.email.hasError('email')) {
                <mat-error>Enter a valid email</mat-error>
              } @else if (form.controls.email.hasError('server')) {
                <mat-error>{{ form.controls.email.getError('server') }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                [autocomplete]="mode() === 'login' ? 'current-password' : 'new-password'"
              />
              @if (form.controls.password.hasError('required') && form.controls.password.touched) {
                <mat-error>Password is required</mat-error>
              } @else if (form.controls.password.hasError('minlength')) {
                <mat-error>At least 8 characters</mat-error>
              } @else if (form.controls.password.hasError('server')) {
                <mat-error>{{ form.controls.password.getError('server') }}</mat-error>
              }
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit" [disabled]="submitting()">
              {{ mode() === 'login' ? 'Sign in' : 'Create account' }}
            </button>
          </form>

          <p class="mt-4 text-center text-sm opacity-70">
            @if (mode() === 'login') {
              Don't have an account?
              <a routerLink="/register" class="text-blue-700 hover:underline">Create one</a>
            } @else {
              Already have an account?
              <a routerLink="/login" class="text-blue-700 hover:underline">Sign in</a>
            }
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class AuthPageComponent {
  readonly mode = input<'login' | 'register'>('login');

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly loginMutation = injectLogin();
  private readonly registerMutation = injectRegister();

  readonly submitting = signal(false);
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const body = this.form.getRawValue();
    try {
      if (this.mode() === 'login') {
        await this.loginMutation.mutateAsync(body);
      } else {
        await this.registerMutation.mutateAsync(body);
      }
      const returnTo = this.route.snapshot.queryParamMap.get('returnTo') ?? '/';
      await this.router.navigateByUrl(returnTo);
    } catch (error) {
      applyApiError(error, this.form);
    } finally {
      this.submitting.set(false);
    }
  }
}
