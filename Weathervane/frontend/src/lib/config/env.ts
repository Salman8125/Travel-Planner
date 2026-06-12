import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:4004"),
});

const parsed = schema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL.replace(/\/+$/, ""),
};

export const MAX_FORECAST_SPAN_DAYS = 16;
