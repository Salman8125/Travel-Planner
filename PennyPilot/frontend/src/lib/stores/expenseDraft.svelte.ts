import { v4 as uuidv4 } from 'uuid';

export interface ExpenseDraft {
  amount: string;
  date: string;
  description: string;
  currency: string;
  categoryId: string | null;
}

function makeKey(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {}
  return uuidv4();
}

function emptyDraft(): ExpenseDraft {
  return { amount: '', date: '', description: '', currency: '', categoryId: null };
}

class ExpenseDraftStore {
  draft = $state<ExpenseDraft>(emptyDraft());
  idempotencyKey = $state<string | null>(null);
  private lastFingerprint = '';

  readonly fingerprint = $derived(
    JSON.stringify({
      amount: this.draft.amount,
      date: this.draft.date,
      categoryId: this.draft.categoryId,
      currency: this.draft.currency,
      description: this.draft.description
    })
  );

  reset(seed?: Partial<ExpenseDraft>): void {
    this.draft = { ...emptyDraft(), ...seed };
    this.idempotencyKey = null;
    this.lastFingerprint = '';
  }

  beginAttempt(): string {
    if (!this.idempotencyKey || this.fingerprint !== this.lastFingerprint) {
      this.idempotencyKey = makeKey();
      this.lastFingerprint = this.fingerprint;
    }
    return this.idempotencyKey;
  }

  invalidateKey(): void {
    this.idempotencyKey = null;
  }

  succeed(): void {
    this.reset();
  }
}

export const expenseDraft = new ExpenseDraftStore();
