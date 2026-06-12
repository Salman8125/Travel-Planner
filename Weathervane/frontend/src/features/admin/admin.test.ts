import { fireEvent, screen, waitFor } from "@testing-library/vue";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";

import type { LocationInput } from "@/lib/api/models";
import { ADMIN_TOKEN } from "@/test/msw/fixtures";
import { renderWithProviders } from "@/test/utils";

import { useCreateLocation } from "./mutations";

vi.mock("vue-sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const NEW_LOCATION: LocationInput = {
  name: "Doha",
  city: "Doha",
  country: "QA",
  latitude: 25.2854,
  longitude: 51.531,
  timezone: "Asia/Qatar",
};

const Harness = defineComponent({
  setup() {
    const create = useCreateLocation();
    return () =>
      h("button", { onClick: () => void create.mutateAsync(NEW_LOCATION) }, "create");
  },
});

describe("admin create invalidation", () => {
  it("invalidates location queries after a successful create", async () => {
    localStorage.setItem("weathervane.auth", JSON.stringify({ token: ADMIN_TOKEN }));

    const { queryClient } = renderWithProviders(Harness);
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    await fireEvent.click(screen.getByText("create"));

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith({ queryKey: ["locations"] }),
    );
  });
});
