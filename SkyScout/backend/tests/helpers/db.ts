import { sql as raw } from "../../src/infra/db/client.js";
import type { Cabin } from "../../src/shared/enums.js";
import * as cabinInventoryRepository from "../../src/modules/flights/repositories/cabinInventory.repository.js";
import * as flightRepository from "../../src/modules/flights/repositories/flight.repository.js";
import * as referenceRepository from "../../src/modules/reference/repositories/reference.repository.js";
import * as authService from "../../src/modules/auth/services/auth.service.js";
import type { AuthResult } from "../../src/modules/auth/types/auth.types.js";

let flightSeq = 0;

export async function truncateAll(): Promise<void> {
  await raw`TRUNCATE passengers, bookings, cabin_inventory, flights, users, airports, airlines RESTART IDENTITY CASCADE`;
}

export async function createUser(email: string, password: string): Promise<AuthResult> {
  return authService.register(email, password);
}

export async function createAdmin(email: string, password: string): Promise<AuthResult> {
  await authService.register(email, password);
  await raw`update users set role = 'ADMIN' where email = ${email.toLowerCase()}`;
  return authService.login(email, password);
}

export interface SeededFlight {
  flightId: string;
  originIata: string;
  destIata: string;
  airlineIata: string;
  departureDate: string;
  departure: Date;
}

export async function seedFlight(
  opts: { seats?: number; cabin?: Cabin; basePrice?: string; departure?: Date } = {},
): Promise<SeededFlight> {
  await raw`insert into airports (iata_code, name, city, country, timezone) values ('AAA','Alpha','Alpha','AA','UTC') on conflict do nothing`;
  await raw`insert into airports (iata_code, name, city, country, timezone) values ('BBB','Beta','Beta','BB','UTC') on conflict do nothing`;
  await raw`insert into airlines (iata_code, name) values ('ZZ','Zeta Air') on conflict do nothing`;
  const [origin] = await referenceRepository.findAirportIdByIata("AAA");
  const [dest] = await referenceRepository.findAirportIdByIata("BBB");
  const [airline] = await referenceRepository.findAirlineIdByIata("ZZ");

  const departure = opts.departure ?? new Date(Date.now() + 7 * 24 * 3600 * 1000);
  const arrival = new Date(departure.getTime() + 3 * 3600 * 1000);
  flightSeq += 1;
  const [flight] = await flightRepository.insertFlight({
    flightNumber: `ZZ${100 + flightSeq}`,
    airlineId: airline.id,
    originId: origin.id,
    destinationId: dest.id,
    scheduledDeparture: departure,
    scheduledArrival: arrival,
    status: "SCHEDULED",
    aircraftId: null,
  });

  const seats = opts.seats ?? 50;
  await cabinInventoryRepository.insertMany([
    {
      flightId: flight.id,
      cabin: opts.cabin ?? "ECONOMY",
      totalSeats: Math.max(seats, 1),
      availableSeats: seats,
      basePrice: opts.basePrice ?? "200.00",
      currency: "USD",
    },
  ]);

  return {
    flightId: flight.id,
    originIata: "AAA",
    destIata: "BBB",
    airlineIata: "ZZ",
    departureDate: departure.toISOString().slice(0, 10),
    departure,
  };
}

export async function availableSeats(flightId: string, cabin: Cabin = "ECONOMY"): Promise<number> {
  const [row] = await raw<{ available_seats: number }[]>`
    select available_seats from cabin_inventory where flight_id = ${flightId} and cabin = ${cabin} limit 1`;
  return row.available_seats;
}
