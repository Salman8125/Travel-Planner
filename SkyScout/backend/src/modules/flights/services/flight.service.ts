import { Decimal } from "decimal.js";

import { db } from "../../../infra/db/client.js";
import { ConflictError, NotFoundError, ValidationError } from "../../../shared/errors.js";
import type { Cabin, FlightStatus } from "../../../shared/enums.js";
import * as money from "../../../shared/money.js";
import type { PaginationMeta } from "../../../shared/pagination.js";
import * as referenceService from "../../reference/services/reference.service.js";
import { durationMinutes, fromPrice, toSummary } from "../mappers/flight.mapper.js";
import * as cabinInventoryRepository from "../repositories/cabinInventory.repository.js";
import * as flightRepository from "../repositories/flight.repository.js";
import type { FlightRow } from "../repositories/flight.repository.js";
import type {
  CreateFlightInput,
  FlightSearchResult,
  FlightSummaryDTO,
  SearchFilters,
  SearchFlightsInput,
  SetStatusInput,
  UpdateFlightInput,
} from "../types/flight.types.js";

const BOOKABLE_STATUSES: FlightStatus[] = ["SCHEDULED", "DELAYED", "BOARDING"];

function dayRangeUtc(date: string): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) throw new ValidationError(`Invalid date: ${date}`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function applyFilters(rows: FlightRow[], cabin: Cabin | undefined, filters: SearchFilters | undefined) {
  return rows.filter((f) => {
    if (f.status === "CANCELLED" || !BOOKABLE_STATUSES.includes(f.status as FlightStatus)) return false;
    if (cabin && !f.cabinInventory.some((c) => c.cabin === cabin && c.availableSeats > 0)) return false;

    const price = fromPrice(f, cabin);
    if (price === null) return false;
    if (filters?.priceMin && new Decimal(price).lt(filters.priceMin)) return false;
    if (filters?.priceMax && new Decimal(price).gt(filters.priceMax)) return false;
    if (filters?.airlines && filters.airlines.length > 0 && !filters.airlines.includes(f.airline.iataCode)) return false;
    if (filters?.departureWindow?.from && f.scheduledDeparture < new Date(filters.departureWindow.from)) return false;
    if (filters?.departureWindow?.to && f.scheduledDeparture > new Date(filters.departureWindow.to)) return false;
    if (filters?.maxStops !== undefined && filters.maxStops < 0) return false;
    return true;
  });
}

function sortFlights(rows: FlightRow[], cabin: Cabin | undefined, sortBy: SearchFlightsInput["sortBy"], order: SearchFlightsInput["order"]) {
  const dir = order === "desc" ? -1 : 1;
  const sorted = [...rows];
  sorted.sort((a, b) => {
    let cmp = 0;
    if (sortBy === "departure") {
      cmp = a.scheduledDeparture.getTime() - b.scheduledDeparture.getTime();
    } else if (sortBy === "duration") {
      cmp = durationMinutes(a.scheduledDeparture, a.scheduledArrival) - durationMinutes(b.scheduledDeparture, b.scheduledArrival);
    } else {
      cmp = new Decimal(fromPrice(a, cabin) ?? "0").comparedTo(fromPrice(b, cabin) ?? "0");
    }
    return cmp * dir;
  });
  return sorted;
}

async function searchOneWay(
  originId: string,
  destinationId: string,
  date: string,
  input: SearchFlightsInput,
): Promise<{ data: FlightSummaryDTO[]; meta: PaginationMeta }> {
  const { start, end } = dayRangeUtc(date);
  const rows = await flightRepository.findForRoute(originId, destinationId, start, end);
  const filtered = sortFlights(
    applyFilters(rows, input.cabin, input.filters),
    input.cabin,
    input.sortBy ?? "departure",
    input.order ?? "asc",
  );

  const total = filtered.length;
  const { page, pageSize } = input;
  const startIdx = (page - 1) * pageSize;
  const data = filtered.slice(startIdx, startIdx + pageSize).map(toSummary);

  return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function search(input: SearchFlightsInput): Promise<FlightSearchResult> {
  if (input.origin.trim().toUpperCase() === input.destination.trim().toUpperCase()) {
    throw new ValidationError("origin and destination must differ");
  }
  const { start: depStart } = dayRangeUtc(input.departureDate);
  if (depStart.getTime() < new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z").getTime()) {
    throw new ValidationError("departureDate must not be in the past");
  }
  if (input.returnDate) {
    const { start: retStart } = dayRangeUtc(input.returnDate);
    if (retStart < depStart) throw new ValidationError("returnDate must not be before departureDate");
  }

  const originId = await referenceService.airportIdByIata(input.origin);
  const destinationId = await referenceService.airportIdByIata(input.destination);

  const outbound = await searchOneWay(originId, destinationId, input.departureDate, input);
  const result: FlightSearchResult = { outbound };
  if (input.returnDate) {
    result.inbound = await searchOneWay(destinationId, originId, input.returnDate, input);
  }
  return result;
}

export async function getById(id: string): Promise<FlightSummaryDTO> {
  const row = await flightRepository.findById(id);
  if (!row) {
    throw new NotFoundError("Flight not found");
  }
  return toSummary(row as FlightRow);
}

export async function createFlight(input: CreateFlightInput): Promise<FlightSummaryDTO> {
  if (input.origin.trim().toUpperCase() === input.destination.trim().toUpperCase()) {
    throw new ValidationError("origin and destination must differ");
  }
  const airlineId = await referenceService.airlineIdByIata(input.airlineIata);
  const originId = await referenceService.airportIdByIata(input.origin);
  const destinationId = await referenceService.airportIdByIata(input.destination);

  const id = await db.transaction(async (tx) => {
    const [created] = await flightRepository.insertFlight(
      {
        flightNumber: input.flightNumber,
        airlineId,
        originId,
        destinationId,
        scheduledDeparture: new Date(input.scheduledDeparture),
        scheduledArrival: new Date(input.scheduledArrival),
        status: "SCHEDULED",
        aircraftId: input.aircraftId ?? null,
      },
      tx,
    );
    await cabinInventoryRepository.insertMany(
      input.cabins.map((c) => ({
        flightId: created.id,
        cabin: c.cabin,
        totalSeats: c.totalSeats,
        availableSeats: c.totalSeats,
        basePrice: money.toMoney(c.basePrice),
        currency: c.currency,
      })),
      tx,
    );
    return created.id;
  });

  return getById(id);
}

export async function updateFlight(id: string, patch: UpdateFlightInput): Promise<FlightSummaryDTO> {
  const set: Partial<{
    flightNumber: string;
    scheduledDeparture: Date;
    scheduledArrival: Date;
    aircraftId: string | null;
    status: FlightStatus;
  }> = {};
  if (patch.flightNumber !== undefined) set.flightNumber = patch.flightNumber;
  if (patch.scheduledDeparture !== undefined) set.scheduledDeparture = new Date(patch.scheduledDeparture);
  if (patch.scheduledArrival !== undefined) set.scheduledArrival = new Date(patch.scheduledArrival);
  if (patch.aircraftId !== undefined) set.aircraftId = patch.aircraftId;
  if (patch.status !== undefined) set.status = patch.status;

  const updated = await flightRepository.updateFlight(id, set);
  if (updated.length === 0) throw new NotFoundError("Flight not found");
  return getById(id);
}

export async function setStatus(id: string, status: SetStatusInput["status"]): Promise<FlightSummaryDTO> {
  if (status === "CANCELLED") return cancelFlightCascade(id);
  const updated = await flightRepository.setStatus(id, status);
  if (updated.length === 0) throw new NotFoundError("Flight not found");
  return getById(id);
}

export async function cancelFlightCascade(id: string): Promise<FlightSummaryDTO> {
  await db.transaction(async (tx) => {
    const [flight] = await flightRepository.findRawById(id, tx);
    if (!flight || flight.deletedAt) throw new NotFoundError("Flight not found");
    await cabinInventoryRepository.lockByFlight(id, tx);
    await flightRepository.lockActiveBookingsByFlight(id, tx);
    const release = await flightRepository.seatReleaseByCabin(id, tx);
    await flightRepository.cancelActiveBookingsByFlight(id, tx);
    for (const r of release) {
      await cabinInventoryRepository.increment(id, r.cabin as Cabin, r.seats, tx);
    }
    await flightRepository.setStatus(id, "CANCELLED", tx);
  });
  return getById(id);
}

export async function deleteFlight(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [flight] = await flightRepository.findRawById(id, tx);
    if (!flight || flight.deletedAt) throw new NotFoundError("Flight not found");
    const active = await flightRepository.countActiveBookings(id, tx);
    if (active > 0) throw new ConflictError("Flight has active bookings", "flight_has_bookings");
    await flightRepository.softDelete(id, tx);
  });
}
