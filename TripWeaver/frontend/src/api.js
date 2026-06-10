// Backend base URL: baked at build time from VITE_API_URL (see Dockerfile build ARG).
// Must be http://localhost:<port> — the browser is outside the docker network.
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4005";

// Sample inputs. In this phase the products don't talk to each other, so the itinerary demo
// supplies its own flight/hotel/forecast/budget (mirroring the other domains' shapes) and
// posts them to its OWN backend, which composes them into an itinerary.
export const SAMPLE_INPUT = {
  flight: {
    flightId: "FL-1001",
    airline: "Skyline Airways",
    origin: "JFK",
    destination: "LHR",
    departureTime: "2026-07-01T08:30:00Z",
    arrivalTime: "2026-07-01T20:15:00Z",
    price: 742.0,
    stops: 0,
  },
  hotel: {
    hotelId: "HT-2001",
    name: "The Thames View",
    starRating: 4,
    pricePerNight: 180.0,
    totalPrice: 540.0,
    amenities: ["WiFi", "Breakfast", "Pool"],
  },
  forecast: [
    { date: "2026-07-01", high: 24.0, low: 15.0, condition: "Sunny" },
    { date: "2026-07-02", high: 21.0, low: 14.0, condition: "Cloudy" },
  ],
  budget: { totalBudget: 5000.0, spent: 1200.0, remaining: 3800.0 },
};

export async function buildItinerary(input) {
  const res = await fetch(`${API_URL}/build_itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`build_itinerary failed: ${res.status}`);
  return res.json();
}
