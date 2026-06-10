import { Router } from "express";

import { requireAuth } from "../../shared/http/middleware/auth.js";
import { authLimiter } from "../../shared/http/middleware/rateLimit.js";
import { validate } from "../../shared/http/middleware/validate.js";
import * as authController from "./controllers/auth.controller.js";
import { loginSchema, registerSchema } from "./schemas/auth.schemas.js";

export const authRoutes = Router();

authRoutes.post("/register", authLimiter, validate(registerSchema), authController.register);
authRoutes.post("/login", authLimiter, validate(loginSchema), authController.login);
authRoutes.get("/me", requireAuth, authController.me);
