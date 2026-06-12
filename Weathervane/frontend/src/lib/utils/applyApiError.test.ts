import type { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/ApiError";

import { applyApiError } from "./applyApiError";

const toastError = vi.fn();
vi.mock("vue-sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: vi.fn(),
  },
}));

function apiError(status: number, code: string, message: string, details?: Record<string, string>) {
  return ApiError.fromAxios({
    isAxiosError: true,
    response: { status, data: { error: { code, message, details } } },
  } as unknown as AxiosError);
}

describe("applyApiError", () => {
  beforeEach(() => toastError.mockClear());

  it("maps field details to inline errors and returns true", () => {
    const setErrors = vi.fn();
    const result = applyApiError(
      apiError(400, "validation_error", "Invalid", { password: "too short" }),
      setErrors,
    );
    expect(setErrors).toHaveBeenCalledWith({ password: "too short" });
    expect(result).toBe(true);
  });

  it("toasts the message when there are no field details", () => {
    const setErrors = vi.fn();
    const result = applyApiError(apiError(401, "unauthorized", "Invalid credentials"), setErrors);
    expect(setErrors).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith("Invalid credentials");
    expect(result).toBe(false);
  });

  it("toasts a generic message for unknown errors", () => {
    const setErrors = vi.fn();
    applyApiError(new Error("boom"), setErrors);
    expect(toastError).toHaveBeenCalled();
  });
});
