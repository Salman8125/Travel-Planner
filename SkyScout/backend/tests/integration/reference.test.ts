import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../../src/app.js";
import { bearer } from "../helpers/fixtures.js";
import { createAdmin, createUser, seedFlight, truncateAll } from "../helpers/db.js";

const app = buildApp();

beforeEach(async () => {
  await truncateAll();
});

describe("reference", () => {
  it("admin create (lowercase→upper) + public GET list/detail", async () => {
    const admin = await createAdmin("admin@e.com", "password123");
    const created = await request(app)
      .post("/api/airports")
      .set(bearer(admin.token))
      .send({ iataCode: "kul", name: "Kuala Lumpur", city: "KL", country: "my", timezone: "Asia/Kuala_Lumpur" });
    expect(created.status).toBe(201);
    expect(created.body.data.iataCode).toBe("KUL");
    expect(created.body.data.country).toBe("MY");

    expect((await request(app).get("/api/airports")).status).toBe(200);
    expect((await request(app).get(`/api/airports/${created.body.data.id}`)).status).toBe(200);
  });

  it("duplicate IATA → 409; non-admin → 403", async () => {
    const admin = await createAdmin("admin@e.com", "password123");
    const user = await createUser("u@e.com", "password123");
    await request(app).post("/api/airlines").set(bearer(admin.token)).send({ iataCode: "QF", name: "Qantas" });
    expect((await request(app).post("/api/airlines").set(bearer(admin.token)).send({ iataCode: "qf", name: "X" })).status).toBe(409);
    expect((await request(app).post("/api/airlines").set(bearer(user.token)).send({ iataCode: "AB", name: "X" })).status).toBe(403);
  });

  it("delete referenced by a flight → 409; unused → 204", async () => {
    const admin = await createAdmin("admin@e.com", "password123");
    await seedFlight(); // creates airline ZZ referenced by a flight
    const airlines = await request(app).get("/api/airlines?pageSize=100");
    const zz = airlines.body.data.find((a: { iataCode: string; id: string }) => a.iataCode === "ZZ");
    expect((await request(app).delete(`/api/airlines/${zz.id}`).set(bearer(admin.token))).status).toBe(409);

    const unused = await request(app).post("/api/airlines").set(bearer(admin.token)).send({ iataCode: "XX", name: "Unused" });
    expect((await request(app).delete(`/api/airlines/${unused.body.data.id}`).set(bearer(admin.token))).status).toBe(204);
  });
});
