<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { computed } from "vue";

import { Button } from "@/components/ui";
import type { PaginationMeta } from "@/lib/api/models";

const props = defineProps<{ meta: PaginationMeta }>();
const emit = defineEmits<{ "update:page": [page: number] }>();

const canPrev = computed(() => props.meta.page > 1);
const canNext = computed(() => props.meta.page < props.meta.totalPages);
</script>

<template>
  <nav class="flex items-center justify-between gap-4" aria-label="Pagination">
    <p class="text-sm text-muted-foreground">
      Page {{ meta.page }} of {{ meta.totalPages }} · {{ meta.total }} results
    </p>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="!canPrev"
        aria-label="Previous page"
        @click="emit('update:page', meta.page - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
        Prev
      </Button>
      <Button
        variant="outline"
        size="sm"
        :disabled="!canNext"
        aria-label="Next page"
        @click="emit('update:page', meta.page + 1)"
      >
        Next
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </nav>
</template>
