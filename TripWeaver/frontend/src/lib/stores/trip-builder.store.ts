import { v4 as uuidv4 } from 'uuid';

let currentKey: string | null = null;
let currentSignature: string | null = null;

export const idempotency = {
  keyFor(signature: string): string {
    if (currentKey && currentSignature === signature) return currentKey;
    currentKey = uuidv4();
    currentSignature = signature;
    return currentKey;
  },
  reset(): void {
    currentKey = null;
    currentSignature = null;
  },
};
