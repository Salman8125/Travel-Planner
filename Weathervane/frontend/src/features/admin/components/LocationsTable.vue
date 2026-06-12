<script setup lang="ts">
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
  type SortingState,
} from "@tanstack/vue-table";
import { Pencil, Trash2 } from "lucide-vue-next";
import { ref } from "vue";

import { Button } from "@/components/ui";
import type { Location } from "@/lib/api/models";

const props = defineProps<{ locations: Location[] }>();
const emit = defineEmits<{ edit: [location: Location]; delete: [location: Location] }>();

const columnHelper = createColumnHelper<Location>();
const columns = [
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("city", { header: "City" }),
  columnHelper.accessor("country", { header: "Country" }),
  columnHelper.accessor("timezone", { header: "Timezone" }),
];

const sorting = ref<SortingState>([]);
const table = useVueTable({
  get data() {
    return props.locations;
  },
  columns,
  state: {
    get sorting() {
      return sorting.value;
    },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === "function" ? updater(sorting.value) : updater;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

const sortIndicator: Record<string, string> = { asc: " ↑", desc: " ↓" };
</script>

<template>
  <div class="overflow-x-auto rounded-xl border">
    <table class="w-full text-sm">
      <thead class="border-b bg-muted/50">
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="cursor-pointer select-none px-4 py-3 text-left font-medium"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            <span class="text-muted-foreground">{{
              sortIndicator[(header.column.getIsSorted() as string) || ""] ?? ""
            }}</span>
          </th>
          <th class="px-4 py-3 text-right font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          class="border-b last:border-0 hover:bg-accent/40"
        >
          <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="px-4 py-3">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </td>
          <td class="px-4 py-3">
            <div class="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                :aria-label="`Edit ${row.original.name}`"
                @click="emit('edit', row.original)"
              >
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                :aria-label="`Delete ${row.original.name}`"
                @click="emit('delete', row.original)"
              >
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
