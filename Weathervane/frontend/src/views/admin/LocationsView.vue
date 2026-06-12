<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { computed, ref } from "vue";

import EmptyState from "@/components/common/EmptyState.vue";
import ErrorState from "@/components/common/ErrorState.vue";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from "@/components/ui";
import ConfirmDeleteDialog from "@/features/admin/components/ConfirmDeleteDialog.vue";
import LocationForm from "@/features/admin/components/LocationForm.vue";
import LocationsTable from "@/features/admin/components/LocationsTable.vue";
import { useLocationsList } from "@/features/locations/queries";
import type { Location } from "@/lib/api/models";

const params = computed(() => ({ page: 1, pageSize: 100 }));
const query = useLocationsList(params);
const locations = computed(() => query.data.value?.data ?? []);

const formOpen = ref(false);
const editing = ref<Location | null>(null);
const deleteOpen = ref(false);
const deleting = ref<Location | null>(null);

function openCreate() {
  editing.value = null;
  formOpen.value = true;
}
function openEdit(location: Location) {
  editing.value = location;
  formOpen.value = true;
}
function openDelete(location: Location) {
  deleting.value = location;
  deleteOpen.value = true;
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Locations</h2>
      <Button size="sm" @click="openCreate">
        <Plus class="h-4 w-4" />
        Add location
      </Button>
    </div>

    <div v-if="query.isLoading.value" class="space-y-2">
      <Skeleton v-for="n in 6" :key="n" class="h-12 w-full" />
    </div>

    <ErrorState
      v-else-if="query.isError.value"
      :error="query.error.value"
      @retry="query.refetch()"
    />

    <EmptyState
      v-else-if="locations.length === 0"
      title="No locations yet"
      description="Create your first location to start adding forecast data."
    >
      <Button size="sm" @click="openCreate">
        <Plus class="h-4 w-4" />
        Add location
      </Button>
    </EmptyState>

    <LocationsTable v-else :locations="locations" @edit="openEdit" @delete="openDelete" />

    <Dialog v-model:open="formOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editing ? "Edit location" : "New location" }}</DialogTitle>
        </DialogHeader>
        <LocationForm
          :key="editing?.id ?? 'new'"
          :location="editing"
          @saved="formOpen = false"
          @cancel="formOpen = false"
        />
      </DialogContent>
    </Dialog>

    <ConfirmDeleteDialog v-model:open="deleteOpen" :location="deleting" />
  </div>
</template>
