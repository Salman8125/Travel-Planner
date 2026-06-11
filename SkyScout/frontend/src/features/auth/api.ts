import { http, unwrap } from "@/lib/apiClient";
import type { AuthResult, User } from "@/types/app";

import type { LoginInput, RegisterInput } from "./schemas";

export function login(input: LoginInput): Promise<AuthResult> {
  return unwrap<AuthResult>(http.post("/api/auth/login", input));
}

export function register(input: RegisterInput): Promise<AuthResult> {
  return unwrap<AuthResult>(http.post("/api/auth/register", input));
}

export function me(): Promise<User> {
  return unwrap<User>(http.get("/api/auth/me"));
}
