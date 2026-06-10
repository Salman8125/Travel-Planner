import bcrypt from "bcryptjs";
import { sql as dsql } from "drizzle-orm";

import { config } from "../../config/env.js";
import { db, sql } from "./client.js";
import { airlines, airports, cabinInventory, flights, users } from "./schema.js";

const AIRPORTS = [
  { iataCode: "ISB", name: "Islamabad International", city: "Islamabad", country: "PK", timezone: "Asia/Karachi" },
  { iataCode: "KHI", name: "Jinnah International", city: "Karachi", country: "PK", timezone: "Asia/Karachi" },
  { iataCode: "LHE", name: "Allama Iqbal International", city: "Lahore", country: "PK", timezone: "Asia/Karachi" },
  { iataCode: "IST", name: "Istanbul Airport", city: "Istanbul", country: "TR", timezone: "Europe/Istanbul" },
  { iataCode: "DXB", name: "Dubai International", city: "Dubai", country: "AE", timezone: "Asia/Dubai" },
  { iataCode: "DOH", name: "Hamad International", city: "Doha", country: "QA", timezone: "Asia/Qatar" },
  { iataCode: "JFK", name: "John F. Kennedy International", city: "New York", country: "US", timezone: "America/New_York" },
  { iataCode: "LHR", name: "Heathrow", city: "London", country: "GB", timezone: "Europe/London" },
  { iataCode: "CDG", name: "Charles de Gaulle", city: "Paris", country: "FR", timezone: "Europe/Paris" },
  { iataCode: "SIN", name: "Changi", city: "Singapore", country: "SG", timezone: "Asia/Singapore" },
];

const AIRLINES = [
  { iataCode: "PK", name: "Pakistan International Airlines" },
  { iataCode: "TK", name: "Turkish Airlines" },
  { iataCode: "EK", name: "Emirates" },
  { iataCode: "QR", name: "Qatar Airways" },
  { iataCode: "BA", name: "British Airways" },
  { iataCode: "AF", name: "Air France" },
];

const ROUTES: Array<[string, string, number]> = [
  ["ISB", "IST", 330], ["IST", "ISB", 330],
  ["ISB", "DXB", 180], ["DXB", "ISB", 180],
  ["LHE", "DXB", 195], ["DXB", "LHE", 195],
  ["KHI", "DOH", 165], ["DOH", "KHI", 165],
  ["IST", "LHR", 240], ["LHR", "IST", 240],
  ["DXB", "LHR", 450], ["LHR", "JFK", 480], ["JFK", "LHR", 420],
  ["CDG", "IST", 200], ["SIN", "DXB", 460], ["DXB", "SIN", 460],
];

const CABIN_PLAN = [
  { cabin: "ECONOMY" as const, totalSeats: 180, priceFactor: 1 },
  { cabin: "BUSINESS" as const, totalSeats: 40, priceFactor: 3 },
  { cabin: "FIRST" as const, totalSeats: 10, priceFactor: 6 },
];

const DAYS = 14;

async function main() {
  const [{ count }] = await db.select({ count: dsql<number>`count(*)::int` }).from(users);
  if (count > 0) {
    console.log("[skyscout] seed skipped (database already populated)");
    await sql.end();
    return;
  }

  console.log("[skyscout] seeding reference data...");
  const airportRows = await db.insert(airports).values(AIRPORTS).returning();
  const airlineRows = await db.insert(airlines).values(AIRLINES).returning();
  const airportByIata = new Map(airportRows.map((a) => [a.iataCode, a]));

  const hash = (pw: string) => bcrypt.hashSync(pw, config.BCRYPT_ROUNDS);
  await db.insert(users).values([
    { email: "admin@skyscout.dev", passwordHash: hash("admin12345"), role: "ADMIN" },
    { email: "user@skyscout.dev", passwordHash: hash("user12345"), role: "USER" },
  ]);

  console.log("[skyscout] generating flights + cabin inventory...");
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let airlineIdx = 0;
  let seq = 1000;
  let flightCount = 0;

  for (let day = 1; day <= DAYS; day++) {
    for (const [originIata, destIata, durationMin] of ROUTES) {
      const origin = airportByIata.get(originIata)!;
      const dest = airportByIata.get(destIata)!;
      const airline = airlineRows[airlineIdx % airlineRows.length];
      airlineIdx++;

      const dep = new Date(today);
      dep.setUTCDate(dep.getUTCDate() + day);
      dep.setUTCHours(6 + (seq % 12), (seq % 4) * 15, 0, 0);
      const arr = new Date(dep.getTime() + durationMin * 60_000);

      const [flight] = await db
        .insert(flights)
        .values({
          flightNumber: `${airline.iataCode}${++seq}`,
          airlineId: airline.id,
          originId: origin.id,
          destinationId: dest.id,
          scheduledDeparture: dep,
          scheduledArrival: arr,
          status: "SCHEDULED",
        })
        .returning();

      const basePrice = 80 + durationMin * 0.6;
      await db.insert(cabinInventory).values(
        CABIN_PLAN.map((c) => ({
          flightId: flight.id,
          cabin: c.cabin,
          totalSeats: c.totalSeats,
          availableSeats: c.totalSeats,
          basePrice: (basePrice * c.priceFactor).toFixed(2),
          currency: "USD",
        })),
      );
      flightCount++;
    }
  }

  console.log(`[skyscout] seeded ${AIRPORTS.length} airports, ${AIRLINES.length} airlines, ${flightCount} flights.`);
  await sql.end();
}

main().catch(async (err) => {
  console.error("[skyscout] seed failed:", err);
  try {
    await sql.end();
  } catch {
    // noop
  }
  process.exit(1);
});
