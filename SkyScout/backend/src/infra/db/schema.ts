import { relations, sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const flightStatusEnum = pgEnum("flight_status", [
  "SCHEDULED",
  "DELAYED",
  "BOARDING",
  "DEPARTED",
  "ARRIVED",
  "CANCELLED",
]);
export const cabinEnum = pgEnum("cabin", ["ECONOMY", "BUSINESS", "FIRST"]);
export const bookingStatusEnum = pgEnum("booking_status", ["PENDING", "CONFIRMED", "CANCELLED", "FAILED"]);
export const passengerTypeEnum = pgEnum("passenger_type", ["ADULT", "CHILD", "INFANT"]);
export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const airports = pgTable(
  "airports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    iataCode: varchar("iata_code", { length: 3 }).notNull(),
    name: text("name").notNull(),
    city: text("city").notNull(),
    country: varchar("country", { length: 2 }).notNull(),
    timezone: text("timezone").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_airports_iata").on(t.iataCode),
    check("airports_iata_format", sql`char_length(${t.iataCode}) = 3 and ${t.iataCode} = upper(${t.iataCode})`),
  ],
);

export const airlines = pgTable(
  "airlines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    iataCode: varchar("iata_code", { length: 2 }).notNull(),
    name: text("name").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_airlines_iata").on(t.iataCode),
    check("airlines_iata_format", sql`char_length(${t.iataCode}) = 2 and ${t.iataCode} = upper(${t.iataCode})`),
  ],
);

export const aircraft = pgTable(
  "aircraft",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registration: text("registration").notNull(),
    model: text("model").notNull(),
    seatCapacity: integer("seat_capacity").notNull(),
  },
  (t) => [uniqueIndex("uq_aircraft_registration").on(t.registration)],
);

export const flights = pgTable(
  "flights",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    flightNumber: varchar("flight_number", { length: 16 }).notNull(),
    airlineId: uuid("airline_id")
      .notNull()
      .references(() => airlines.id, { onDelete: "restrict" }),
    originId: uuid("origin_id")
      .notNull()
      .references(() => airports.id, { onDelete: "restrict" }),
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => airports.id, { onDelete: "restrict" }),
    scheduledDeparture: ts("scheduled_departure").notNull(),
    scheduledArrival: ts("scheduled_arrival").notNull(),
    status: flightStatusEnum("status").notNull().default("SCHEDULED"),
    aircraftId: uuid("aircraft_id").references(() => aircraft.id, { onDelete: "set null" }),
    deletedAt: ts("deleted_at"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_flights_route_dep").on(t.originId, t.destinationId, t.scheduledDeparture),
    check("flights_origin_ne_destination", sql`${t.originId} <> ${t.destinationId}`),
    check("flights_arrival_after_departure", sql`${t.scheduledArrival} > ${t.scheduledDeparture}`),
  ],
);

export const cabinInventory = pgTable(
  "cabin_inventory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    flightId: uuid("flight_id")
      .notNull()
      .references(() => flights.id, { onDelete: "cascade" }),
    cabin: cabinEnum("cabin").notNull(),
    totalSeats: integer("total_seats").notNull(),
    availableSeats: integer("available_seats").notNull(),
    basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_cabin_inventory_flight_cabin").on(t.flightId, t.cabin),
    check("cabin_available_nonneg", sql`${t.availableSeats} >= 0`),
    check("cabin_available_lte_total", sql`${t.availableSeats} <= ${t.totalSeats}`),
    check("cabin_base_price_nonneg", sql`${t.basePrice} >= 0`),
  ],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("USER"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_users_email").on(t.email)],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 6 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    flightId: uuid("flight_id")
      .notNull()
      .references(() => flights.id, { onDelete: "restrict" }),
    cabin: cabinEnum("cabin").notNull(),
    status: bookingStatusEnum("status").notNull().default("PENDING"),
    totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    contactEmail: text("contact_email").notNull(),
    idempotencyKey: text("idempotency_key"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
    cancelledAt: ts("cancelled_at"),
  },
  (t) => [
    uniqueIndex("uq_bookings_reference").on(t.reference),
    uniqueIndex("uq_bookings_idempotency_key")
      .on(t.idempotencyKey)
      .where(sql`${t.idempotencyKey} is not null`),
    index("idx_bookings_user").on(t.userId),
    index("idx_bookings_flight").on(t.flightId),
    check("bookings_total_nonneg", sql`${t.totalPrice} >= 0`),
  ],
);

export const passengers = pgTable(
  "passengers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    dateOfBirth: date("date_of_birth", { mode: "string" }).notNull(),
    type: passengerTypeEnum("type").notNull(),
    passportNumber: text("passport_number"),
    seatNumber: text("seat_number"),
  },
  (t) => [
    index("idx_passengers_booking").on(t.bookingId),
    check("passengers_dob_past", sql`${t.dateOfBirth} < now()`),
  ],
);

export const airportsRelations = relations(airports, ({ many }) => ({
  departures: many(flights, { relationName: "origin" }),
  arrivals: many(flights, { relationName: "destination" }),
}));

export const airlinesRelations = relations(airlines, ({ many }) => ({
  flights: many(flights),
}));

export const aircraftRelations = relations(aircraft, ({ many }) => ({
  flights: many(flights),
}));

export const flightsRelations = relations(flights, ({ one, many }) => ({
  airline: one(airlines, { fields: [flights.airlineId], references: [airlines.id] }),
  origin: one(airports, { fields: [flights.originId], references: [airports.id], relationName: "origin" }),
  destination: one(airports, {
    fields: [flights.destinationId],
    references: [airports.id],
    relationName: "destination",
  }),
  aircraft: one(aircraft, { fields: [flights.aircraftId], references: [aircraft.id] }),
  cabinInventory: many(cabinInventory),
  bookings: many(bookings),
}));

export const cabinInventoryRelations = relations(cabinInventory, ({ one }) => ({
  flight: one(flights, { fields: [cabinInventory.flightId], references: [flights.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  flight: one(flights, { fields: [bookings.flightId], references: [flights.id] }),
  passengers: many(passengers),
}));

export const passengersRelations = relations(passengers, ({ one }) => ({
  booking: one(bookings, { fields: [passengers.bookingId], references: [bookings.id] }),
}));
