import type { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import { ApiError, isApiError } from "./ApiError";

function axiosErrorWith(status: number, body: unknown): AxiosError {
  return {
    isAxiosError: true,
    response: { status, data: body, statusText: "", headers: {}, config: {} },
    config: {},
  } as unknown as AxiosError;
}

describe("ApiError.fromAxios", () => {
  it("parses the backend error envelope", () => {
    const err = ApiError.fromAxios(
      axiosErrorWith(404, {
        error: { code: "not_found", message: "Location not found", requestId: "req-1" },
      }),
    );
    expect(err.status).toBe(404);
    expect(err.code).toBe("not_found");
    expect(err.message).toBe("Location not found");
    expect(err.requestId).toBe("req-1");
    expect(isApiError(err)).toBe(true);
  });

  it("treats a missing response as a network error", () => {
    const err = ApiError.fromAxios({ isAxiosError: true } as AxiosError);
    expect(err.isNetwork).toBe(true);
    expect(err.status).toBe(0);
  });
});

describe("ApiError.flatten", () => {
  it("splits the flat details map into field and form errors", () => {
    const err = ApiError.fromAxios(
      axiosErrorWith(400, {
        error: {
          code: "validation_error",
          message: "Invalid",
          details: { email: "is required", non_field_errors: "bad combination" },
        },
      }),
    );
    const flat = err.flatten;
    expect(flat).toBeDefined();
    expect(flat?.fieldErrors.email).toEqual(["is required"]);
    expect(flat?.formErrors).toContain("bad combination");
  });

  it("returns undefined when there are no details", () => {
    const err = ApiError.fromAxios(
      axiosErrorWith(401, { error: { code: "unauthorized", message: "nope" } }),
    );
    expect(err.flatten).toBeUndefined();
  });
});
