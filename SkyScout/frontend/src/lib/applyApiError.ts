import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

import { ApiError } from "./ApiError";

export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (error instanceof ApiError) {
    const flat = error.flatten;
    if (flat) {
      let fieldMatched = false;
      for (const [field, messages] of Object.entries(flat.fieldErrors)) {
        if (messages?.length) {
          setError(field as Path<T>, { type: "server", message: messages[0] });
          fieldMatched = true;
        }
      }
      if (flat.formErrors.length) toast.error(flat.formErrors.join(" "));
      if (fieldMatched || flat.formErrors.length) return fieldMatched;
    }
    toast.error(error.message);
    return false;
  }
  toast.error("Something went wrong. Please try again.");
  return false;
}
