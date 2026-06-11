import { describe, expect, it, beforeEach } from 'vitest';
import { expenseDraft } from './expenseDraft.svelte';

describe('expenseDraft idempotency lifecycle', () => {
  beforeEach(() => expenseDraft.reset());

  it('reuses the key across retries with an unchanged body', () => {
    expenseDraft.draft.amount = '50.00';
    expenseDraft.draft.date = '2026-01-15';
    const first = expenseDraft.beginAttempt();
    const second = expenseDraft.beginAttempt();
    expect(second).toBe(first);
  });

  it('regenerates the key when the body changes', () => {
    expenseDraft.draft.amount = '50.00';
    const first = expenseDraft.beginAttempt();
    expenseDraft.draft.amount = '60.00';
    const second = expenseDraft.beginAttempt();
    expect(second).not.toBe(first);
  });

  it('clears the draft and key on success', () => {
    expenseDraft.draft.amount = '50.00';
    expenseDraft.beginAttempt();
    expenseDraft.succeed();
    expect(expenseDraft.draft.amount).toBe('');
    expect(expenseDraft.idempotencyKey).toBeNull();
  });

  it('invalidateKey forces a fresh key on the next attempt', () => {
    expenseDraft.draft.amount = '50.00';
    const first = expenseDraft.beginAttempt();
    expenseDraft.invalidateKey();
    const second = expenseDraft.beginAttempt();
    expect(second).not.toBe(first);
  });
});
