import { TestBed } from '@angular/core/testing';

import { WizardDraftStore } from './wizard-draft.store';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('WizardDraftStore (Idempotency-Key)', () => {
  let store: WizardDraftStore;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    store = TestBed.inject(WizardDraftStore);
  });

  it('reuses the same key for an identical signature (retries reuse the key)', () => {
    const first = store.keyFor('sig-A');
    expect(first).toMatch(UUID_RE);
    expect(store.keyFor('sig-A')).toBe(first);
    expect(store.keyFor('sig-A')).toBe(first);
  });

  it('regenerates the key when the booking signature changes', () => {
    const first = store.keyFor('sig-A');
    const second = store.keyFor('sig-B');
    expect(second).not.toBe(first);
    expect(second).toMatch(UUID_RE);
  });

  it('clear() forces a fresh key for the next intent', () => {
    const first = store.keyFor('sig-A');
    store.clear();
    expect(store.keyFor('sig-A')).not.toBe(first);
  });
});
