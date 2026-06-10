import type { NextFunction, Request, Response } from "express";

import { UnauthorizedError } from "../../../shared/errors.js";
import { ok } from "../../../shared/http/response.js";
import * as authService from "../services/auth.service.js";

export async function register(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = res.locals.body as { email: string; password: string };
    ok(res, await authService.register(email, password), 201);
  } catch (err) {
    next(err);
  }
}

export async function login(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = res.locals.body as { email: string; password: string };
    ok(res, await authService.login(email, password));
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    ok(res, await authService.me(req.user.id));
  } catch (err) {
    next(err);
  }
}
