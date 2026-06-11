import { describe, expect, it } from "vitest";

import { formatDuration, formatTime } from "./date";

describe("date", () => {
  it("renders an instant in the airport's timezone, not the browser's", () => {
    const iso = "2026-06-20T12:30:00.000Z";
    expect(formatTime(iso, "Asia/Dubai")).toBe("16:30");
    expect(formatTime(iso, "Asia/Karachi")).toBe("17:30");
    expect(formatTime(iso, "UTC")).toBe("12:30");
  });

  it("formats a duration in hours and minutes", () => {
    expect(formatDuration(180)).toBe("3h 00m");
    expect(formatDuration(95)).toBe("1h 35m");
  });
});
