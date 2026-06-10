import { Router } from "express";

import { requireAuth } from "../../shared/http/middleware/auth.js";
import { validate } from "../../shared/http/middleware/validate.js";
import * as bookingController from "./controllers/booking.controller.js";
import { createBookingSchema, listQuerySchema, referenceParamSchema } from "./schemas/booking.schemas.js";

export const bookingRoutes = Router();

bookingRoutes.post("/", requireAuth, validate(createBookingSchema), bookingController.create);
bookingRoutes.get("/", requireAuth, validate(listQuerySchema, "query"), bookingController.list);
bookingRoutes.get("/:reference", requireAuth, validate(referenceParamSchema, "params"), bookingController.getByReference);
bookingRoutes.post("/:reference/cancel", requireAuth, validate(referenceParamSchema, "params"), bookingController.cancel);
