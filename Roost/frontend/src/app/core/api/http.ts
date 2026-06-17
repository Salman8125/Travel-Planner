import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

import { config } from '@core/config/app-config';

import type { PageMeta } from './models';

type ParamValue = string | number | boolean | undefined | null;
type Params = Record<string, ParamValue>;

@Injectable({ providedIn: 'root' })
export class HttpApi {
  private readonly http = inject(HttpClient);
  private readonly base = config.apiUrl;

  private url(path: string): string {
    return `${this.base}${path}`;
  }

  private toParams(params?: Params): HttpParams {
    let hp = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          hp = hp.set(key, String(value));
        }
      }
    }
    return hp;
  }

  getOne<T>(path: string, params?: Params): Promise<T> {
    return firstValueFrom(
      this.http
        .get<{ data: T }>(this.url(path), { params: this.toParams(params) })
        .pipe(map((r) => r.data)),
    );
  }

  getList<T>(path: string, params?: Params): Promise<{ data: T[]; meta: PageMeta }> {
    return firstValueFrom(
      this.http.get<{ data: T[]; meta: PageMeta }>(this.url(path), { params: this.toParams(params) }),
    );
  }

  post<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return firstValueFrom(
      this.http.post<{ data: T }>(this.url(path), body, { headers }).pipe(map((r) => r.data)),
    );
  }

  postList<T>(path: string, body: unknown): Promise<{ data: T[]; meta: PageMeta }> {
    return firstValueFrom(this.http.post<{ data: T[]; meta: PageMeta }>(this.url(path), body));
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(
      this.http.patch<{ data: T }>(this.url(path), body).pipe(map((r) => r.data)),
    );
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.put<{ data: T }>(this.url(path), body).pipe(map((r) => r.data)));
  }

  delete(path: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(this.url(path)));
  }
}
