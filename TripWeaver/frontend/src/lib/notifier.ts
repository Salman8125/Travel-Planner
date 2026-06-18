type Notifier = (message: string) => void;

let errorNotifier: Notifier | null = null;
let successNotifier: Notifier | null = null;

export function setErrorNotifier(fn: Notifier): void {
  errorNotifier = fn;
}

export function setSuccessNotifier(fn: Notifier): void {
  successNotifier = fn;
}

export function notifyError(message: string): void {
  errorNotifier?.(message);
}

export function notifySuccess(message: string): void {
  successNotifier?.(message);
}
