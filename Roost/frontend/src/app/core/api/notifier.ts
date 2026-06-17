let errorNotifier: ((message: string) => void) | null = null;
let successNotifier: ((message: string) => void) | null = null;

export function setErrorNotifier(fn: (message: string) => void): void {
  errorNotifier = fn;
}

export function setSuccessNotifier(fn: (message: string) => void): void {
  successNotifier = fn;
}

export function notifyError(message: string): void {
  errorNotifier?.(message);
}

export function notifySuccess(message: string): void {
  successNotifier?.(message);
}
