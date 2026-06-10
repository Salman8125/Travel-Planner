import type { UserRole } from "../../../shared/enums.js";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
