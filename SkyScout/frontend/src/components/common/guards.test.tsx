import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { useAuthStore } from "@/store/authStore";
import { adminFixture, userFixture } from "@/test/msw/fixtures";
import { renderWithProviders } from "@/test/test-utils";

import { AdminRoute } from "./AdminRoute";
import { ProtectedRoute } from "./ProtectedRoute";

function renderGuarded(route: string) {
  return renderWithProviders(
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/bookings" element={<div>Secret Bookings</div>} />
      </Route>
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<div>Admin Home</div>} />
      </Route>
      <Route path="/login" element={<div>Login Screen</div>} />
    </Routes>,
    { route },
  );
}

describe("route guards", () => {
  it("redirects unauthenticated users to login", () => {
    useAuthStore.setState({ token: null, user: null, bootstrapped: true });
    renderGuarded("/bookings");
    expect(screen.getByText("Login Screen")).toBeInTheDocument();
  });

  it("renders protected content when authenticated", () => {
    useAuthStore.setState({ token: "t", user: userFixture, bootstrapped: true });
    renderGuarded("/bookings");
    expect(screen.getByText("Secret Bookings")).toBeInTheDocument();
  });

  it("shows 403 for non-admins on admin routes", () => {
    useAuthStore.setState({ token: "t", user: userFixture, bootstrapped: true });
    renderGuarded("/admin");
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it("allows admins into admin routes", () => {
    useAuthStore.setState({ token: "t", user: adminFixture, bootstrapped: true });
    renderGuarded("/admin");
    expect(screen.getByText("Admin Home")).toBeInTheDocument();
  });
});
