import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../../src/app.js";
import { dateIn } from "../helpers/fixtures.js";
import { seedFlight, truncateAll } from "../helpers/db.js";

const app = buildApp();
const pax = { adults: 1, children: 0, infants: 0 };

beforeEach(async () => {
  await truncateAll();
});

describe("flights search", () => {
  it("rejects invalid input with 400", async () => {
    const f = await seedFlight();
    const cases = [
      { origin: f.originIata, destination: f.originIata, departureDate: f.departureDate }, // same
      { origin: f.originIata, destination: f.destIata, departureDate: "2020-01-01" }, // past
      { origin: f.originIata, destination: f.destIata, departureDate: "not-a-date" }, // malformed
      { origin: "QQQ", destination: f.destIata, departureDate: dateIn(7) }, // unknown IATA
    ];
    for (const c of cases) {
      const r = await request(app).post("/api/flights/search").send({ ...c, passengers: pax });
      expect(r.status).toBe(400);
    }
  });

  it("returns the seeded flight; no-results → 200 + empty meta", async () => {
    const f = await seedFlight();
    const ok = await request(app).post("/api/flights/search").send({ origin: f.originIata, destination: f.destIata, departureDate: f.departureDate, passengers: pax });
    expect(ok.status).toBe(200);
    expect(ok.body.data.outbound.data).toHaveLength(1);
    expect(ok.body.data.outbound.meta.total).toBe(1);

    const empty = await request(app).post("/api/flights/search").send({ origin: f.destIata, destination: f.originIata, departureDate: f.departureDate, passengers: pax });
    expect(empty.status).toBe(200);
    expect(empty.body.data.outbound.data).toHaveLength(0);
    expect(empty.body.data.outbound.meta.total).toBe(0);
  });

  it("getById → 404 for unknown flight", async () => {
    const r = await request(app).get("/api/flights/11111111-1111-1111-1111-111111111111");
    expect(r.status).toBe(404);
  });
});
