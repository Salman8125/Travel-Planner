import { screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { useAuthStore } from "@/store/authStore";
import { renderWithProviders } from "@/test/test-utils";

import LoginPage from "./pages/LoginPage";

function renderLogin(route = "/login") {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/flights" element={<div>Flights Home</div>} />
      <Route path="/bookings" element={<div>Bookings Home</div>} />
    </Routes>,
    { route },
  );
}

describe("login", () => {
  it("signs in, stores the token, and redirects to /flights", async () => {
    const { user } = renderLogin();

    await user.type(screen.getByLabelText(/email/i), "user@skyscout.dev");
    await user.type(screen.getByLabelText(/password/i), "user12345");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(useAuthStore.getState().token).toBe("test.jwt.token"));
    expect(await screen.findByText("Flights Home")).toBeInTheDocument();
  });

  it("redirects to the returnTo target after login", async () => {
    const { user } = renderLogin("/login?returnTo=%2Fbookings");

    await user.type(screen.getByLabelText(/email/i), "user@skyscout.dev");
    await user.type(screen.getByLabelText(/password/i), "user12345");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Bookings Home")).toBeInTheDocument();
  });

  it("shows an error on invalid credentials without storing a token", async () => {
    const { user } = renderLogin();

    await user.type(screen.getByLabelText(/email/i), "user@skyscout.dev");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
