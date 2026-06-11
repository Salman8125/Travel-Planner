import { screen, waitFor, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { useAuthStore } from "@/store/authStore";
import { userFixture } from "@/test/msw/fixtures";
import { renderWithProviders } from "@/test/test-utils";

import BookingDetailPage from "./pages/BookingDetailPage";

describe("booking cancellation", () => {
  it("cancels a booking and reflects the cancelled status", async () => {
    useAuthStore.setState({ token: "t", user: userFixture, bootstrapped: true });

    const { user } = renderWithProviders(
      <Routes>
        <Route path="/bookings/:reference" element={<BookingDetailPage />} />
      </Routes>,
      { route: "/bookings/4XHN36" },
    );

    expect(await screen.findByText("4XHN36")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancel booking/i }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /yes, cancel/i }));

    await waitFor(() => expect(screen.getByText(/cancelled/i)).toBeInTheDocument());
  });
});
