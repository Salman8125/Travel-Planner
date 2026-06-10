import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../../src/app.js";
import { bearer, bookingBody, isoIn } from "../helpers/fixtures.js";
import { availableSeats, createAdmin, createUser, seedFlight, truncateAll } from "../helpers/db.js";

const app = buildApp();

async function setupRefData(token: string) {
  await request(app).post("/api/airlines").set(bearer(token)).send({ iataCode: "ZZ", name: "Zeta Air" });
  await request(app).post("/api/airports").set(bearer(token)).send({ iataCode: "AAA", name: "Alpha", city: "Alpha", country: "AA", timezone: "UTC" });
  await request(app).post("/api/airports").set(bearer(token)).send({ iataCode: "BBB", name: "Beta", city: "Beta", country: "BB", timezone: "UTC" });
}

function flightBody() {
  return {
    flightNumber: "ZZ900",
    airlineIata: "ZZ",
    origin: "AAA",
    destination: "BBB",
    scheduledDeparture: isoIn(72),
    scheduledArrival: isoIn(75),
    cabins: [{ cabin: "ECONOMY", totalSeats: 50, basePrice: "150.00", currency: "USD" }],
  };
}

beforeEach(async () => {
  await truncateAll();
});

describe("flights admin", () => {
  it("create → 201 + searchable; unknown airline IATA → 400; non-admin → 403", async () => {
    const admin = await createAdmin("admin@e.com", "password123");
    const user = await createUser("u@e.com", "password123");
    await setupRefData(admin.token);

    const created = await request(app).post("/api/flights").set(bearer(admin.token)).send(flightBody());
    expect(created.status).toBe(201);

    const found = await request(app)
      .post("/api/flights/search")
      .send({ origin: "AAA", destination: "BBB", departureDate: created.body.data.scheduledDeparture.slice(0, 10), passengers: { adults: 1, children: 0, infants: 0 } });
    expect(found.body.data.outbound.data.length).toBeGreaterThanOrEqual(1);

    expect((await request(app).post("/api/flights").set(bearer(admin.token)).send({ ...flightBody(), airlineIata: "QQ" })).status).toBe(400);
    expect((await request(app).post("/api/flights").set(bearer(user.token)).send(flightBody())).status).toBe(403);
  });

  it("PATCH :id with status CANCELLED is schema-forbidden → 400", async () => {
    const admin = await createAdmin("admin@e.com", "password123");
    const f = await seedFlight();
    const r = await request(app).patch(`/api/flights/${f.flightId}`).set(bearer(admin.token)).send({ status: "CANCELLED" });
    expect(r.status).toBe(400);
  });

  it("PATCH :id/status CANCELLED cascades → bookings cancelled + seats released", async () => {
    const admin = await createAdmin("admin@e.com", "password123");
    const user = await createUser("u@e.com", "password123");
    const f = await seedFlight({ seats: 10 });

    const booked = await request(app).post("/api/bookings").set(bearer(user.token)).send(bookingBody(f.flightId));
    expect(booked.status).toBe(201);
    expect(await availableSeats(f.flightId)).toBe(9);

    const cancel = await request(app).patch(`/api/flights/${f.flightId}/status`).set(bearer(admin.token)).send({ status: "CANCELLED" });
    expect(cancel.status).toBe(200);
    expect(await availableSeats(f.flightId)).toBe(10);

    const fetched = await request(app).get(`/api/bookings/${booked.body.data.reference}`).set(bearer(user.token));
    expect(fetched.body.data.status).toBe("CANCELLED");
  });

  it("DELETE with active booking → 409; clean flight → 204 (excluded after)", async () => {
    const admin = await createAdmin("admin@e.com", "password123");
    const user = await createUser("u@e.com", "password123");

    const withBooking = await seedFlight();
    await request(app).post("/api/bookings").set(bearer(user.token)).send(bookingBody(withBooking.flightId));
    expect((await request(app).delete(`/api/flights/${withBooking.flightId}`).set(bearer(admin.token))).status).toBe(409);

    const clean = await seedFlight();
    expect((await request(app).delete(`/api/flights/${clean.flightId}`).set(bearer(admin.token))).status).toBe(204);
    expect((await request(app).get(`/api/flights/${clean.flightId}`)).status).toBe(404);
  });
});
