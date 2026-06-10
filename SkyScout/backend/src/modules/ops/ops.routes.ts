import { Router } from "express";

import * as opsController from "./controllers/ops.controller.js";

export const opsRoutes = Router();

opsRoutes.get("/health", opsController.health);
opsRoutes.get("/ready", opsController.ready);
