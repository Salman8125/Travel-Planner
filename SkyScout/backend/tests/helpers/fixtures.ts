export function bearer(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export function isoIn(hours: number): string {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString();
}

export function dateIn(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

export function bookingBody(flightId: string, opts: { cabin?: string; email?: string } = {}) {
  return {
    flightId,
    cabin: opts.cabin ?? "ECONOMY",
    contactEmail: opts.email ?? "c@example.com",
    passengers: [{ firstName: "Alice", lastName: "Smith", dateOfBirth: "1990-01-01", type: "ADULT" }],
  };
}
