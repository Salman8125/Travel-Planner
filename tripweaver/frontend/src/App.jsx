import { createSignal } from "solid-js";
import { Show } from "solid-js/web";
import { API_URL, SAMPLE_INPUT, buildItinerary } from "./api";

export function App() {
  const [result, setResult] = createSignal(null);
  const [error, setError] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  async function build() {
    setLoading(true);
    setError(null);
    try {
      setResult(await buildItinerary(SAMPLE_INPUT));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={s.page}>
      <h1>🧳 TripWeaver</h1>
      <p style={s.sub}>
        Weave a trip together — talks only to its own backend at <code>{API_URL}</code>.
        It posts a sample flight + hotel + forecast + budget (no calls to other backends).
      </p>

      <button onClick={build} disabled={loading()}>
        {loading() ? "Building…" : "Build itinerary"}
      </button>

      <Show when={error()}>
        <p style={s.error}>Error: {error()}</p>
      </Show>

      <Show when={result()}>
        {(r) => (
          <div style={s.card}>
            <h2>Trip to {r().destination}</h2>
            <p>{r().summary}</p>
            <div style={s.row}>Flight: {r().flight.airline} ({r().flight.origin} → {r().flight.destination})</div>
            <div style={s.row}>Hotel: {r().hotel.name} — {"★".repeat(r().hotel.starRating)}</div>
            <div style={s.row}>Forecast days: {r().forecast.length}</div>
            <div style={s.row}>
              Estimated cost: <strong>${r().estimatedCost.toFixed(2)}</strong> —{" "}
              <span style={{ color: r().withinBudget ? "#0a7d28" : "#b00020" }}>
                {r().withinBudget ? "within budget ✅" : "OVER budget ❌"}
              </span>
            </div>
          </div>
        )}
      </Show>
    </main>
  );
}

const s = {
  page: { "font-family": "system-ui, sans-serif", "max-width": "640px", margin: "2rem auto", padding: "0 1rem" },
  sub: { color: "#555" },
  card: { border: "1px solid #ddd", "border-radius": "8px", padding: "1rem", "margin-top": "1rem" },
  row: { color: "#444", margin: "4px 0" },
  error: { color: "#b00020" },
};
