import { Injectable, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class WizardDraftStore {
  private readonly key = signal<string | null>(null);
  private readonly signature = signal<string | null>(null);

  keyFor(signature: string): string {
    const existing = this.key();
    if (existing && this.signature() === signature) {
      return existing;
    }
    const next = uuidv4();
    this.signature.set(signature);
    this.key.set(next);
    return next;
  }

  clear(): void {
    this.key.set(null);
    this.signature.set(null);
  }
}
