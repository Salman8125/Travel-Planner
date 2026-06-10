import { Router } from "express";

import { requireAdmin, requireAuth } from "../../shared/http/middleware/auth.js";
import { validate } from "../../shared/http/middleware/validate.js";
import * as flightController from "./controllers/flight.controller.js";
import { createFlightSchema, idParamSchema, searchSchema, setStatusSchema, updateFlightSchema } from "./schemas/flight.schemas.js";

export const flightRoutes = Router();

flightRoutes.post("/search", validate(searchSchema), flightController.search);
flightRoutes.get("/:id", validate(idParamSchema, "params"), flightController.getById);

flightRoutes.post("/", requireAuth, requireAdmin, validate(createFlightSchema), flightController.create);
flightRoutes.patch("/:id", requireAuth, requireAdmin, validate(idParamSchema, "params"), validate(updateFlightSchema), flightController.update);
flightRoutes.patch("/:id/status", requireAuth, requireAdmin, validate(idParamSchema, "params"), validate(setStatusSchema), flightController.setStatus);
flightRoutes.delete("/:id", requireAuth, requireAdmin, validate(idParamSchema, "params"), flightController.remove);
