import type { NextFunction, Request, Response } from "express";

import { ForbiddenError, UnauthorizedError } from "../../errors.js";
import { verifyToken } from "../../../modules/auth/services/auth.service.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing or malformed Authorization header"));
  }
  try {
    const payload = verifyToken(header.slice("Bearer ".length).trim());
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(new UnauthorizedError("Authentication required"));
  if (req.user.role !== "ADMIN") return next(new ForbiddenError("Admin privileges required"));
  next();
}
