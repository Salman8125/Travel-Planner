import { toast } from "vue-sonner";

import { ApiError } from "@/lib/api/ApiError";

type SetErrors = (fields: Partial<Record<string, string | undefined>>) => void;

export function applyApiError(error: unknown, setErrors: SetErrors): boolean {
  if (error instanceof ApiError) {
    const flat = error.flatten;
    if (flat) {
      const fieldMap: Record<string, string> = {};
      for (const [field, messages] of Object.entries(flat.fieldErrors)) {
        if (messages.length) fieldMap[field] = messages[0];
      }
      const hasFieldErrors = Object.keys(fieldMap).length > 0;
      if (hasFieldErrors) setErrors(fieldMap);
      if (flat.formErrors.length) toast.error(flat.formErrors.join(" "));
      if (hasFieldErrors || flat.formErrors.length) return hasFieldErrors;
    }
    toast.error(error.message);
    return false;
  }
  toast.error("Something went wrong. Please try again.");
  return false;
}
