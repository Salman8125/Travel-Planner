import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { config } from "../../../config/env.js";
import { ConflictError, UnauthorizedError } from "../../../shared/errors.js";
import * as authRepository from "../repositories/auth.repository.js";
import type { AuthResult, AuthUser, JwtPayload } from "../types/auth.types.js";

function sign(user: AuthUser): string {
  const options: jwt.SignOptions = { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] };
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, config.JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export async function register(email: string, password: string): Promise<AuthResult> {
  const normalized = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
  try {
    const [row] = await authRepository.create({ email: normalized, passwordHash });
    const user: AuthUser = { id: row.id, email: row.email, role: row.role };
    return { token: sign(user), user };
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      throw new ConflictError("Email already registered", "email_taken");
    }
    throw err;
  }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const normalized = email.trim().toLowerCase();
  const [row] = await authRepository.findByEmail(normalized);
  const hash = row?.passwordHash ?? "$2a$12$0000000000000000000000000000000000000000000000000000a";
  const ok = await bcrypt.compare(password, hash);
  if (!row || !ok) {
    throw new UnauthorizedError("Invalid credentials");
  }
  const user: AuthUser = { id: row.id, email: row.email, role: row.role };
  return { token: sign(user), user };
}

export async function me(userId: string): Promise<AuthUser> {
  const [row] = await authRepository.findById(userId);
  if (!row) {
    throw new UnauthorizedError("Invalid credentials");
  }
  return { id: row.id, email: row.email, role: row.role };
}
