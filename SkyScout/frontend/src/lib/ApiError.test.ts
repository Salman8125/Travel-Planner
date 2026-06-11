import type { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import { ApiError } from "./ApiError";

function axiosErrorWith(status: number, data: unknown): AxiosError {
  return { response: { status, data }, config: {} } as AxiosError;
}

describe("ApiError", () => {
  it("normalizes a server error envelope", () => {
    const err = ApiError.fromAxios(
      axiosErrorWith(409, { error: { code: "insufficient_seats", message: "No seats", requestId: "r1" } }),
    );
    expect(err.status).toBe(409);
    expect(err.code).toBe("insufficient_seats");
    expect(err.message).toBe("No seats");
    expect(err.requestId).toBe("r1");
  });

  it("exposes the zod flatten payload for 400s", () => {
    const err = ApiError.fromAxios(
      axiosErrorWith(400, {
        error: {
          code: "validation_error",
          message: "Bad",
          details: { formErrors: [], fieldErrors: { email: ["Invalid email"] } },
        },
      }),
    );
    expect(err.flatten?.fieldErrors.email).toEqual(["Invalid email"]);
  });

  it("flags network errors when there is no response", () => {
    const err = ApiError.fromAxios({ config: {}, code: "ERR_NETWORK" } as AxiosError);
    expect(err.isNetwork).toBe(true);
    expect(err.status).toBe(0);
  });
});
