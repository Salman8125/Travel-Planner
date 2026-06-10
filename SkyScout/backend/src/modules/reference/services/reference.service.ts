import { NotFoundError, ValidationError } from "../../../shared/errors.js";
import type { PaginationMeta } from "../../../shared/pagination.js";
import * as referenceRepository from "../repositories/reference.repository.js";
import type {
  AirlineDTO,
  AirportDTO,
  CreateAirlineInput,
  CreateAirportInput,
  UpdateAirlineInput,
  UpdateAirportInput,
} from "../types/reference.types.js";

type AirportRow = { id: string; iataCode: string; name: string; city: string; country: string; timezone: string };
type AirlineRow = { id: string; iataCode: string; name: string };

function toAirport(r: AirportRow): AirportDTO {
  return { id: r.id, iataCode: r.iataCode, name: r.name, city: r.city, country: r.country, timezone: r.timezone };
}

function toAirline(r: AirlineRow): AirlineDTO {
  return { id: r.id, iataCode: r.iataCode, name: r.name };
}

function pageMeta(page: number, pageSize: number, total: number): PaginationMeta {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function airportIdByIata(iata: string): Promise<string> {
  const code = iata.trim().toUpperCase();
  const [row] = await referenceRepository.findAirportIdByIata(code);
  if (!row) throw new ValidationError(`Unknown airport code: ${code}`);
  return row.id;
}

export async function airlineIdByIata(iata: string): Promise<string> {
  const code = iata.trim().toUpperCase();
  const [row] = await referenceRepository.findAirlineIdByIata(code);
  if (!row) throw new ValidationError(`Unknown airline code: ${code}`);
  return row.id;
}

export async function listAirports(page: number, pageSize: number): Promise<{ data: AirportDTO[]; meta: PaginationMeta }> {
  const rows = await referenceRepository.listAirports(pageSize, (page - 1) * pageSize);
  const total = await referenceRepository.countAirports();
  return { data: rows.map(toAirport), meta: pageMeta(page, pageSize, total) };
}

export async function getAirport(id: string): Promise<AirportDTO> {
  const [row] = await referenceRepository.findAirportById(id);
  if (!row) throw new NotFoundError("Airport not found");
  return toAirport(row);
}

export async function createAirport(input: CreateAirportInput): Promise<AirportDTO> {
  const [row] = await referenceRepository.insertAirport(input);
  return toAirport(row);
}

export async function updateAirport(id: string, patch: UpdateAirportInput): Promise<AirportDTO> {
  const [row] = await referenceRepository.updateAirport(id, patch);
  if (!row) throw new NotFoundError("Airport not found");
  return toAirport(row);
}

export async function deleteAirport(id: string): Promise<void> {
  const deleted = await referenceRepository.deleteAirport(id);
  if (deleted.length === 0) throw new NotFoundError("Airport not found");
}

export async function listAirlines(page: number, pageSize: number): Promise<{ data: AirlineDTO[]; meta: PaginationMeta }> {
  const rows = await referenceRepository.listAirlines(pageSize, (page - 1) * pageSize);
  const total = await referenceRepository.countAirlines();
  return { data: rows.map(toAirline), meta: pageMeta(page, pageSize, total) };
}

export async function getAirline(id: string): Promise<AirlineDTO> {
  const [row] = await referenceRepository.findAirlineById(id);
  if (!row) throw new NotFoundError("Airline not found");
  return toAirline(row);
}

export async function createAirline(input: CreateAirlineInput): Promise<AirlineDTO> {
  const [row] = await referenceRepository.insertAirline(input);
  return toAirline(row);
}

export async function updateAirline(id: string, patch: UpdateAirlineInput): Promise<AirlineDTO> {
  const [row] = await referenceRepository.updateAirline(id, patch);
  if (!row) throw new NotFoundError("Airline not found");
  return toAirline(row);
}

export async function deleteAirline(id: string): Promise<void> {
  const deleted = await referenceRepository.deleteAirline(id);
  if (deleted.length === 0) throw new NotFoundError("Airline not found");
}
