import { Router } from "express";

import { requireAdmin, requireAuth } from "../../shared/http/middleware/auth.js";
import { validate } from "../../shared/http/middleware/validate.js";
import * as referenceController from "./controllers/reference.controller.js";
import {
  createAirlineSchema,
  createAirportSchema,
  idParamSchema,
  listQuerySchema,
  updateAirlineSchema,
  updateAirportSchema,
} from "./schemas/reference.schemas.js";

export const airportRoutes = Router();
airportRoutes.get("/", validate(listQuerySchema, "query"), referenceController.listAirports);
airportRoutes.get("/:id", validate(idParamSchema, "params"), referenceController.getAirport);
airportRoutes.post("/", requireAuth, requireAdmin, validate(createAirportSchema), referenceController.createAirport);
airportRoutes.patch("/:id", requireAuth, requireAdmin, validate(idParamSchema, "params"), validate(updateAirportSchema), referenceController.updateAirport);
airportRoutes.delete("/:id", requireAuth, requireAdmin, validate(idParamSchema, "params"), referenceController.deleteAirport);

export const airlineRoutes = Router();
airlineRoutes.get("/", validate(listQuerySchema, "query"), referenceController.listAirlines);
airlineRoutes.get("/:id", validate(idParamSchema, "params"), referenceController.getAirline);
airlineRoutes.post("/", requireAuth, requireAdmin, validate(createAirlineSchema), referenceController.createAirline);
airlineRoutes.patch("/:id", requireAuth, requireAdmin, validate(idParamSchema, "params"), validate(updateAirlineSchema), referenceController.updateAirline);
airlineRoutes.delete("/:id", requireAuth, requireAdmin, validate(idParamSchema, "params"), referenceController.deleteAirline);
