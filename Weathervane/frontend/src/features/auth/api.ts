import { http, unwrap } from "@/lib/api/client";
import type { AuthResult, Credentials, User } from "@/lib/api/models";

export function register(body: Credentials): Promise<AuthResult> {
  return unwrap<AuthResult>(http.post("/api/auth/register", body));
}

export function login(body: Credentials): Promise<AuthResult> {
  return unwrap<AuthResult>(http.post("/api/auth/login", body));
}

export function getMe(): Promise<User> {
  return unwrap<User>(http.get("/api/auth/me"));
}
