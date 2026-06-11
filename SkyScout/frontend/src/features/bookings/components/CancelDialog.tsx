import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useCancelBooking } from "../mutations";

interface CancelDialogProps {
  reference: string;
  disabled?: boolean;
}

export function CancelDialog({ reference, disabled }: CancelDialogProps) {
  const [open, setOpen] = useState(false);
  const cancel = useCancelBooking();

  const onConfirm = () => {
    cancel.mutate(reference, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={disabled}>
          Cancel booking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>
            Booking {reference} will be cancelled and the seats released. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={cancel.isPending}>
            Keep booking
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={cancel.isPending}>
            Yes, cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
