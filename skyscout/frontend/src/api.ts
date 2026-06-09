// Backend base URL: baked at build time from VITE_API_URL (see Dockerfile build ARG).
// Defaults to the published host port so the app works standalone too.
// NOTE: must be http://localhost:<port> — the browser is outside the docker network.
export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4001";

export interface FlightOption {
  flightId: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  stops: number;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const searchFlights = (origin: string, destination: string) =>
  post<FlightOption[]>("/search_flights", { origin, destination });
