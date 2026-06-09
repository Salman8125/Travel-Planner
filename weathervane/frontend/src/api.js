// Backend base URL: baked at build time from VITE_API_URL (see Dockerfile build ARG).
// Must be http://localhost:<port> — the browser is outside the docker network.
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4004";

export async function getForecast(city, days) {
  const res = await fetch(`${API_URL}/get_forecast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, days }),
  });
  if (!res.ok) throw new Error(`get_forecast failed: ${res.status}`);
  return res.json();
}
