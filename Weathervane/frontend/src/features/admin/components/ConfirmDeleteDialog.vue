<script setup lang="ts">
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@/components/ui";
import type { Location } from "@/lib/api/models";

import { useDeleteLocation } from "../mutations";

const open = defineModel<boolean>("open", { default: false });
const props = defineProps<{ location: Location | null }>();
const emit = defineEmits<{ deleted: [] }>();

const mutation = useDeleteLocation();

function confirm() {
  if (!props.location) return;
  mutation.mutate(props.location, {
    onSuccess: () => {
      open.value = false;
      emit("deleted");
    },
  });
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete location</DialogTitle>
        <DialogDescription>
          This permanently removes <strong>{{ location?.name }}</strong> and its forecast data.
          This can't be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button variant="destructive" :disabled="mutation.isPending.value" @click="confirm">
          <Spinner v-if="mutation.isPending.value" />
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
