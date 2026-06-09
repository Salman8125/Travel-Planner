import { useState } from "react";
import { searchFlights, API_URL, type FlightOption } from "./api";

export function App() {
  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("LHR");
  const [results, setResults] = useState<FlightOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setResults(await searchFlights(origin, destination));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <h1>✈️ SkyScout</h1>
      <p style={styles.sub}>Scout the skies for flights — talks only to its own backend at <code>{API_URL}</code></p>

      <form onSubmit={onSearch} style={styles.form}>
        <label>
          Origin
          <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="JFK" />
        </label>
        <label>
          Destination
          <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="LHR" />
        </label>
        <button type="submit" disabled={loading}>{loading ? "Searching…" : "Search flights"}</button>
      </form>

      {error && <p style={styles.error}>Error: {error}</p>}

      <ul style={styles.list}>
        {results.map((f) => (
          <li key={f.flightId} style={styles.card}>
            <strong>{f.airline}</strong> — {f.origin} → {f.destination}
            <div style={styles.meta}>
              {new Date(f.departureTime).toLocaleString()} → {new Date(f.arrivalTime).toLocaleString()}
            </div>
            <div style={styles.meta}>
              {f.stops === 0 ? "Direct" : `${f.stops} stop(s)`} · <strong>${f.price.toFixed(2)}</strong>
            </div>
          </li>
        ))}
      </ul>
      {!loading && !error && results.length === 0 && <p>No flights yet — run a search.</p>}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "2rem auto", padding: "0 1rem" },
  sub: { color: "#555" },
  form: { display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap", margin: "1.25rem 0" },
  list: { listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" },
  card: { border: "1px solid #ddd", borderRadius: 8, padding: "0.75rem 1rem" },
  meta: { color: "#666", fontSize: "0.9rem", marginTop: 4 },
  error: { color: "#b00020" },
};
