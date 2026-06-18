import { createSignal, Show } from 'solid-js';
import { Button } from '@/components/ui/Button';
import type { BuildForm } from '../schemas';

/* eslint-disable @typescript-eslint/no-explicit-any */
function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}
function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function mapImport(raw: any): BuildForm {
  const f = raw.flight ?? {};
  const h = raw.hotel ?? {};
  const b = raw.budget ?? {};
  return {
    title: str(raw.title),
    destination: str(raw.destination),
    flight: {
      flightId: str(f.flightId),
      airline: str(f.airline),
      origin: str(f.origin),
      destination: str(f.destination),
      departureTime: str(f.departureTime).slice(0, 16),
      arrivalTime: str(f.arrivalTime).slice(0, 16),
      price: num(f.price),
      currency: str(f.currency, 'USD').toUpperCase(),
      stops: num(f.stops),
    },
    hotel: {
      hotelId: str(h.hotelId),
      name: str(h.name),
      starRating: num(h.starRating, 4),
      pricePerNight: num(h.pricePerNight),
      totalPrice: num(h.totalPrice),
      currency: str(h.currency, 'USD').toUpperCase(),
      checkIn: str(h.checkIn).slice(0, 10),
      checkOut: str(h.checkOut).slice(0, 10),
      amenities: Array.isArray(h.amenities) ? h.amenities.join(', ') : str(h.amenities),
    },
    weather: Array.isArray(raw.weather)
      ? raw.weather.map((w: any) => ({
          date: str(w.date).slice(0, 10),
          high: num(w.high),
          low: num(w.low),
          condition: str(w.condition),
        }))
      : [],
    budget: {
      totalBudget: num(b.totalBudget),
      spent: num(b.spent),
      remaining: num(b.remaining),
      currency: str(b.currency, 'USD').toUpperCase(),
    },
    preferences: { strictBudget: Boolean(raw.preferences?.strictBudget) },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function ImportJson(props: { onImport: (form: BuildForm) => void }) {
  const [text, setText] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

  const apply = () => {
    setError(null);
    try {
      const raw = JSON.parse(text());
      if (!raw || typeof raw !== 'object') throw new Error('Expected a JSON object');
      props.onImport(mapImport(raw));
      setText('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <details class="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <summary class="cursor-pointer text-sm font-medium text-slate-700">
        Import inputs from JSON (power users)
      </summary>
      <div class="mt-3 flex flex-col gap-2">
        <textarea
          value={text()}
          onInput={(e) => setText(e.currentTarget.value)}
          rows={6}
          spellcheck={false}
          placeholder='{"flight":{…},"hotel":{…},"weather":[…],"budget":{…}}'
          class="w-full rounded-md border border-slate-300 p-2 font-mono text-xs"
        />
        <Show when={error()}>
          <p class="text-sm text-over">{error()}</p>
        </Show>
        <div>
          <Button size="sm" variant="secondary" onClick={apply} disabled={!text().trim()}>
            Prefill the form
          </Button>
        </div>
      </div>
    </details>
  );
}
