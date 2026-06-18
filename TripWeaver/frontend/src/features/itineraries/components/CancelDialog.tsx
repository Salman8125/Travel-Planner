import { Show } from 'solid-js';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useCancelItinerary } from '../mutations';

export function CancelDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: string;
}) {
  const cancel = useCancelItinerary();

  const confirm = async () => {
    try {
      await cancel.mutateAsync(props.reference);
    } finally {
      props.onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="Cancel this itinerary?"
      description="The itinerary status becomes CANCELLED. You can still view it afterwards."
      footer={
        <>
          <Button variant="secondary" onClick={() => props.onOpenChange(false)}>
            Keep it
          </Button>
          <Button variant="danger" onClick={confirm} disabled={cancel.isPending}>
            <Show when={cancel.isPending}>
              <Spinner />
            </Show>
            Cancel itinerary
          </Button>
        </>
      }
    >
      <p class="text-sm text-slate-600">This action can't be undone from the app.</p>
    </Dialog>
  );
}
