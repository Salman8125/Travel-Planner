import { Router } from "express";

import { authRoutes } from "./modules/auth/auth.routes.js";
import { bookingRoutes } from "./modules/bookings/booking.routes.js";
import { flightRoutes } from "./modules/flights/flight.routes.js";
import { airlineRoutes, airportRoutes } from "./modules/reference/reference.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/flights", flightRoutes);
apiRouter.use("/bookings", bookingRoutes);
apiRouter.use("/airports", airportRoutes);
apiRouter.use("/airlines", airlineRoutes);
