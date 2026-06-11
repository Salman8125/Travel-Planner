import { PUBLIC_API_URL } from '$env/static/public';
import { z } from 'zod/v3';

const parsed = z.object({ apiUrl: z.string().url() }).safeParse({ apiUrl: PUBLIC_API_URL });

if (!parsed.success) {
  throw new Error(
    `Invalid PUBLIC_API_URL (got: ${JSON.stringify(PUBLIC_API_URL)}). Set it to the published backend host URL, e.g. http://localhost:4003`
  );
}

export const env = {
  apiUrl: parsed.data.apiUrl.replace(/\/+$/, '')
};
