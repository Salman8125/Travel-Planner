import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../../src/app.js";
import { bearer } from "../helpers/fixtures.js";
import { createUser, truncateAll } from "../helpers/db.js";

const app = buildApp();

beforeEach(async () => {
  await truncateAll();
});

describe("auth", () => {
  it("register → 201 + token (USER role)", async () => {
    const r = await request(app).post("/api/auth/register").send({ email: "a@e.com", password: "password123" });
    expect(r.status).toBe(201);
    expect(r.body.data.token).toBeTruthy();
    expect(r.body.data.user.role).toBe("USER");
  });

  it("login → 200; /me works with token; 401 without", async () => {
    await request(app).post("/api/auth/register").send({ email: "a@e.com", password: "password123" });
    const login = await request(app).post("/api/auth/login").send({ email: "a@e.com", password: "password123" });
    expect(login.status).toBe(200);
    const me = await request(app).get("/api/auth/me").set(bearer(login.body.data.token));
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe("a@e.com");
    expect((await request(app).get("/api/auth/me")).status).toBe(401);
  });

  it("does not leak whether an email exists (wrong-pw vs unknown-email identical)", async () => {
    await request(app).post("/api/auth/register").send({ email: "a@e.com", password: "password123" });
    const wrongPw = await request(app).post("/api/auth/login").send({ email: "a@e.com", password: "wrong" });
    const unknown = await request(app).post("/api/auth/login").send({ email: "ghost@e.com", password: "wrong" });
    expect(wrongPw.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(unknown.body.error.code).toBe(wrongPw.body.error.code);
    expect(unknown.body.error.message).toBe(wrongPw.body.error.message);
  });

  it("USER hitting an admin route → 403", async () => {
    const u = await createUser("u@e.com", "password123");
    const r = await request(app).post("/api/airlines").set(bearer(u.token)).send({ iataCode: "QF", name: "Qantas" });
    expect(r.status).toBe(403);
  });
});
