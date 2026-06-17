import { z } from 'zod';

import { environment } from '@env/environment';

const schema = z.object({
  apiUrl: z.string().url(),
});

const parsed = schema.safeParse(environment);
if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const config = {
  apiUrl: parsed.data.apiUrl.replace(/\/+$/, ''),
};

export const MAX_STAY_NIGHTS = 30;
export const MAX_ROOMS = 10;
