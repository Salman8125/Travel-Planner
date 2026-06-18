import { Show, type JSX } from 'solid-js';
import { Dialog as KDialog } from '@kobalte/core/dialog';
import { X } from 'lucide-solid';

export function Dialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: JSX.Element;
  footer?: JSX.Element;
}) {
  return (
    <KDialog open={props.open} onOpenChange={props.onOpenChange}>
      <KDialog.Portal>
        <KDialog.Overlay class="fixed inset-0 z-40 bg-slate-900/40" />
        <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <KDialog.Content class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div class="flex items-start justify-between gap-4">
              <KDialog.Title class="text-lg font-semibold text-slate-900">{props.title}</KDialog.Title>
              <KDialog.CloseButton class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X size={18} aria-label="Close" />
              </KDialog.CloseButton>
            </div>
            <Show when={props.description}>
              <KDialog.Description class="mt-1 text-sm text-slate-500">
                {props.description}
              </KDialog.Description>
            </Show>
            <div class="mt-4">{props.children}</div>
            <Show when={props.footer}>
              <div class="mt-6 flex justify-end gap-2">{props.footer}</div>
            </Show>
          </KDialog.Content>
        </div>
      </KDialog.Portal>
    </KDialog>
  );
}
