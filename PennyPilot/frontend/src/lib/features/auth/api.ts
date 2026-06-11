import { api } from '$lib/api/client';
import type { AuthResult, Envelope, User } from '$lib/api/models';

export const authApi = {
  async login(email: string, password: string): Promise<AuthResult> {
    const body = await api.post<Envelope<AuthResult>>(
      '/api/auth/login',
      { email, password },
      { suppressAuth: true }
    );
    return body.data;
  },

  async register(email: string, password: string): Promise<AuthResult> {
    const body = await api.post<Envelope<AuthResult>>(
      '/api/auth/register',
      { email, password },
      { suppressAuth: true }
    );
    return body.data;
  },

  async me(): Promise<User> {
    const body = await api.get<Envelope<User>>('/api/auth/me');
    return body.data;
  }
};
