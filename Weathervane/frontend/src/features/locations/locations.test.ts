import { screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";

import { createTestRouter, renderWithProviders } from "@/test/utils";
import HomeView from "@/views/HomeView.vue";

describe("HomeView (public search)", () => {
  it("lists locations from the API with no authentication", async () => {
    const router = createTestRouter();
    await router.push("/");
    await router.isReady();

    renderWithProviders(HomeView, { router });

    expect(await screen.findByText("Istanbul")).toBeInTheDocument();
    expect(await screen.findByText("Tokyo")).toBeInTheDocument();
  });
});
