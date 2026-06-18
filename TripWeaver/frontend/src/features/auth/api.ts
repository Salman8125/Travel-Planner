import { api } from '@/lib/api/client';
import type { AuthResponse, LoginRequest, RegisterRequest, UserDto } from '@/lib/api/models';

export const authApi = {
  login: (body: LoginRequest) => api.post<AuthResponse>('/api/auth/login', body),
  register: (body: RegisterRequest) => api.post<AuthResponse>('/api/auth/register', body),
  me: () => api.get<UserDto>('/api/auth/me'),
};
