import { Injectable, inject } from '@angular/core';

import { HttpApi } from '@core/api/http';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@core/api/models';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly api = inject(HttpApi);

  login(body: LoginRequest): Promise<AuthResponse> {
    return this.api.post<AuthResponse>('/api/auth/login', body);
  }

  register(body: RegisterRequest): Promise<AuthResponse> {
    return this.api.post<AuthResponse>('/api/auth/register', body);
  }
}
