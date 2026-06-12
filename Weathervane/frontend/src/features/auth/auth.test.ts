import { fireEvent, screen, waitFor } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";

import { ADMIN_TOKEN } from "@/test/msw/fixtures";
import { createTestRouter, renderWithProviders } from "@/test/utils";
import LoginView from "@/views/auth/LoginView.vue";

vi.mock("vue-sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

function storedToken(): string | null {
  const raw = localStorage.getItem("weathervane.auth");
  return raw ? (JSON.parse(raw).token ?? null) : null;
}

describe("login flow", () => {
  it("persists the token and routes to the return target", async () => {
    const router = createTestRouter();
    await router.push("/login");
    await router.isReady();

    renderWithProviders(LoginView, { router });

    await fireEvent.update(screen.getByLabelText("Email"), "admin@weathervane.dev");
    await fireEvent.update(screen.getByLabelText("Password"), "admin12345");
    await fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(storedToken()).toBe(ADMIN_TOKEN));
    await waitFor(() => expect(router.currentRoute.value.name).toBe("home"));
  });

  it("does not persist a token on bad credentials", async () => {
    const router = createTestRouter();
    await router.push("/login");
    await router.isReady();

    renderWithProviders(LoginView, { router });

    await fireEvent.update(screen.getByLabelText("Email"), "admin@weathervane.dev");
    await fireEvent.update(screen.getByLabelText("Password"), "wrong-password");
    await fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    const { toast } = await import("vue-sonner");
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(storedToken()).toBeNull();
    expect(router.currentRoute.value.name).toBe("login");
  });
});
