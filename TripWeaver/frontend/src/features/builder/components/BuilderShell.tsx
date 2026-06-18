/* eslint-disable @typescript-eslint/no-explicit-any */
import { For, Show } from 'solid-js';
import {
  createForm,
  getValue,
  getValues,
  insert,
  remove,
  setValue,
  zodForm,
} from '@modular-forms/solid';
import { useNavigate } from '@solidjs/router';
import { CalendarDays, Plus, Trash2 } from 'lucide-solid';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Spinner } from '@/components/ui/Spinner';
import { idempotency } from '@/lib/stores/trip-builder.store';
import { signature } from '@/lib/utils/signature';
import { datePart, tripSpanDays } from '@/lib/utils/date';
import { BuildFormSchema, emptyBuildForm, type BuildForm } from '../schemas';
import { toBuildRequest } from '../api';
import { useBuildItinerary } from '../mutations';
import { applyBuildError } from '../apply-build-error';
import { ImportJson } from './ImportJson';

const SECTION_IDS = ['section-flight', 'section-hotel', 'section-weather', 'section-budget'];

export function BuilderShell() {
  const navigate = useNavigate();
  const build = useBuildItinerary();
  const [form, { Form, Field, FieldArray }] = createForm<BuildForm>({
    validate: zodForm(BuildFormSchema),
    initialValues: emptyBuildForm(),
  });

  const goToStep = (index: number) =>
    document.getElementById(SECTION_IDS[index] ?? '')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleImport = (v: BuildForm) => {
    setValue(form, 'title', v.title ?? '');
    setValue(form, 'destination', v.destination ?? '');
    setValue(form, 'flight.flightId', v.flight.flightId);
    setValue(form, 'flight.airline', v.flight.airline);
    setValue(form, 'flight.origin', v.flight.origin);
    setValue(form, 'flight.destination', v.flight.destination);
    setValue(form, 'flight.departureTime', v.flight.departureTime);
    setValue(form, 'flight.arrivalTime', v.flight.arrivalTime);
    setValue(form, 'flight.price', v.flight.price);
    setValue(form, 'flight.currency', v.flight.currency);
    setValue(form, 'flight.stops', v.flight.stops);
    setValue(form, 'hotel.hotelId', v.hotel.hotelId);
    setValue(form, 'hotel.name', v.hotel.name);
    setValue(form, 'hotel.starRating', v.hotel.starRating);
    setValue(form, 'hotel.pricePerNight', v.hotel.pricePerNight);
    setValue(form, 'hotel.totalPrice', v.hotel.totalPrice);
    setValue(form, 'hotel.currency', v.hotel.currency);
    setValue(form, 'hotel.checkIn', v.hotel.checkIn);
    setValue(form, 'hotel.checkOut', v.hotel.checkOut);
    setValue(form, 'hotel.amenities', v.hotel.amenities ?? '');
    setValue(form, 'budget.totalBudget', v.budget.totalBudget);
    setValue(form, 'budget.spent', v.budget.spent);
    setValue(form, 'budget.remaining', v.budget.remaining);
    setValue(form, 'budget.currency', v.budget.currency);
    setValue(form, 'preferences.strictBudget', v.preferences.strictBudget);
    const existing = getValues(form, 'weather') ?? [];
    for (let i = existing.length - 1; i >= 0; i--) remove(form, 'weather', { at: i });
    for (const w of v.weather) insert(form, 'weather', { value: w });
  };

  const fillTripDates = () => {
    const arrival = datePart(getValue(form, 'flight.arrivalTime') ?? '');
    const checkout = getValue(form, 'hotel.checkOut') ?? '';
    if (!arrival || !checkout || checkout < arrival) return;
    const existing = getValues(form, 'weather') ?? [];
    for (let i = existing.length - 1; i >= 0; i--) remove(form, 'weather', { at: i });
    const [y, m, d] = arrival.split('-').map(Number);
    const span = tripSpanDays(arrival, checkout);
    for (let i = 0; i < span; i++) {
      const dt = new Date(y!, m! - 1, d! + i);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      insert(form, 'weather', { value: { date: iso, high: 20, low: 12, condition: 'SUNNY' } });
    }
  };

  const handleSubmit = async (values: BuildForm) => {
    const body = toBuildRequest(values);
    const key = idempotency.keyFor(signature(body));
    try {
      const dto = await build.mutateAsync({ body, key });
      navigate(`/itineraries/${dto.reference}`);
    } catch (error) {
      applyBuildError(form, error, goToStep);
    }
  };

  const Txt = (p: { name: any; label: string; type?: string; placeholder?: string }) => (
    <Field name={p.name}>
      {(field, props) => (
        <TextField
          {...props}
          label={p.label}
          type={p.type}
          placeholder={p.placeholder}
          value={field.value as string | undefined}
          error={field.error}
        />
      )}
    </Field>
  );

  const Num = (p: { name: any; label: string; step?: string; min?: string }) => (
    <Field name={p.name} type="number">
      {(field, props) => (
        <TextField
          {...props}
          label={p.label}
          type="number"
          step={p.step ?? 'any'}
          min={p.min}
          value={field.value as number | undefined}
          error={field.error}
        />
      )}
    </Field>
  );

  return (
    <Form onSubmit={handleSubmit} class="flex flex-col gap-5 pb-24">
      <ImportJson onImport={handleImport} />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Txt name="title" label="Title (optional)" placeholder="London Getaway" />
        <Txt name="destination" label="Destination (optional)" placeholder="London" />
      </div>

      <Card id="section-flight" class="p-5">
        <h2 class="mb-4 text-lg font-semibold">Flight</h2>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Txt name="flight.flightId" label="Flight ID" placeholder="FL-1001" />
          <Txt name="flight.airline" label="Airline" placeholder="Skyline" />
          <Txt name="flight.origin" label="Origin" placeholder="JFK" />
          <Txt name="flight.destination" label="Destination" placeholder="LHR" />
          <Txt name="flight.departureTime" label="Departure" type="datetime-local" />
          <Txt name="flight.arrivalTime" label="Arrival" type="datetime-local" />
          <Num name="flight.price" label="Price" min="0" />
          <Txt name="flight.currency" label="Currency" placeholder="USD" />
          <Num name="flight.stops" label="Stops" step="1" min="0" />
        </div>
      </Card>

      <Card id="section-hotel" class="p-5">
        <h2 class="mb-4 text-lg font-semibold">Hotel</h2>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Txt name="hotel.hotelId" label="Hotel ID" placeholder="HT-1" />
          <Txt name="hotel.name" label="Name" placeholder="The Thames View" />
          <Num name="hotel.starRating" label="Star rating" step="1" min="1" />
          <Txt name="hotel.currency" label="Currency" placeholder="USD" />
          <Num name="hotel.pricePerNight" label="Price / night" min="0" />
          <Num name="hotel.totalPrice" label="Total price" min="0" />
          <Txt name="hotel.checkIn" label="Check-in" type="date" />
          <Txt name="hotel.checkOut" label="Check-out" type="date" />
          <Txt name="hotel.amenities" label="Amenities (comma-separated)" placeholder="WiFi, Breakfast" />
        </div>
      </Card>

      <Card id="section-weather" class="p-5">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-semibold">Weather forecast</h2>
          <Button type="button" variant="secondary" size="sm" onClick={fillTripDates}>
            <CalendarDays size={16} aria-hidden="true" /> Fill trip dates
          </Button>
        </div>
        <FieldArray name="weather">
          {(fieldArray) => (
            <div class="flex flex-col gap-3">
              <Show
                when={fieldArray.items.length > 0}
                fallback={<p class="text-sm text-slate-500">No forecast days yet. Add one, or use "Fill trip dates".</p>}
              >
                <For each={fieldArray.items}>
                  {(_, index) => (
                    <div class="grid grid-cols-2 items-end gap-2 sm:grid-cols-5">
                      <Txt name={`weather.${index()}.date`} label="Date" type="date" />
                      <Num name={`weather.${index()}.high`} label="High °C" />
                      <Num name={`weather.${index()}.low`} label="Low °C" />
                      <Txt name={`weather.${index()}.condition`} label="Condition" placeholder="SUNNY" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Remove forecast day"
                        onClick={() => remove(form, 'weather', { at: index() })}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </For>
              </Show>
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => insert(form, 'weather', { value: { date: '', high: 20, low: 12, condition: 'SUNNY' } })}
                >
                  <Plus size={16} aria-hidden="true" /> Add forecast day
                </Button>
              </div>
              <Show when={fieldArray.error}>
                <p class="text-sm text-over">{fieldArray.error}</p>
              </Show>
            </div>
          )}
        </FieldArray>
      </Card>

      <Card id="section-budget" class="p-5">
        <h2 class="mb-4 text-lg font-semibold">Budget</h2>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Num name="budget.totalBudget" label="Total budget" min="0" />
          <Txt name="budget.currency" label="Currency" placeholder="USD" />
          <Num name="budget.spent" label="Spent" min="0" />
          <Num name="budget.remaining" label="Remaining" min="0" />
        </div>
        <div class="mt-4">
          <Field name="preferences.strictBudget" type="boolean">
            {(field, props) => (
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" {...props} checked={field.value} class="h-4 w-4 rounded border-slate-300" />
                Reject the trip if it goes over budget (strict)
              </label>
            )}
          </Field>
        </div>
      </Card>

      <div class="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur">
        <div class="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3">
          <Show when={build.isPending}>
            <span class="text-sm text-slate-500">Assembling your itinerary…</span>
          </Show>
          <Button type="submit" disabled={form.submitting}>
            <Show when={form.submitting}>
              <Spinner />
            </Show>
            Build itinerary
          </Button>
        </div>
      </div>
    </Form>
  );
}
