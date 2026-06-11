import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/test-utils";

import FlightSearchPage from "./pages/FlightSearchPage";

const DEEP_LINK =
  "/flights?origin=ISB&destination=DXB&departureDate=2026-06-20&adults=1&children=0&infants=0&page=1&pageSize=10";

describe("flight search", () => {
  it("runs a search from URL params and renders results", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/flights" element={<FlightSearchPage />} />
      </Routes>,
      { route: DEEP_LINK },
    );

    expect(await screen.findByText("EK1147")).toBeInTheDocument();
    expect(screen.getByText(/1 flight/i)).toBeInTheDocument();
    expect(screen.getByText(/\$188\.00/)).toBeInTheDocument();
  });

  it("prompts to search when no query is present", () => {
    renderWithProviders(
      <Routes>
        <Route path="/flights" element={<FlightSearchPage />} />
      </Routes>,
      { route: "/flights" },
    );
    expect(screen.getByText(/start your search/i)).toBeInTheDocument();
  });
});
