import { createSignal, Show } from 'solid-js';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Spinner } from '@/components/ui/Spinner';
import { useUpdateItinerary } from '../mutations';

export function RenameDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: string;
  currentTitle: string;
  rowVersion: () => string;
}) {
  const update = useUpdateItinerary();
  // eslint-disable-next-line solid/reactivity -- dialog is recreated per open; initialise once
  const [title, setTitle] = createSignal(props.currentTitle);

  const save = async () => {
    if (!title().trim()) return;
    try {
      await update.mutateAsync({
        reference: props.reference,
        rowVersion: props.rowVersion(),
        body: { title: title().trim(), days: null },
      });
      props.onOpenChange(false);
    } catch {
      /* errors handled by the mutation's onError */
    }
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="Rename itinerary"
      footer={
        <>
          <Button variant="secondary" onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={update.isPending || !title().trim()}>
            <Show when={update.isPending}>
              <Spinner />
            </Show>
            Save
          </Button>
        </>
      }
    >
      <TextField label="Title" value={title()} onInput={(e) => setTitle(e.currentTarget.value)} />
    </Dialog>
  );
}
