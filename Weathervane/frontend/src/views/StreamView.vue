<script setup lang="ts">
import { ArrowLeft, RadioTower } from "lucide-vue-next";
import { computed, onBeforeUnmount, ref } from "vue";
import { useRoute } from "vue-router";

import EmptyState from "@/components/common/EmptyState.vue";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useLocation } from "@/features/locations/queries";
import { env } from "@/lib/config/env";

type StreamStatus = "idle" | "connecting" | "streaming" | "unavailable";

const route = useRoute();
const id = computed(() => String(route.params.id));
const locationQuery = useLocation(id);
const location = computed(() => locationQuery.data.value);

const status = ref<StreamStatus>("idle");
const events = ref<string[]>([]);
let source: EventSource | null = null;

function stop() {
  source?.close();
  source = null;
}

function start() {
  stop();
  events.value = [];
  status.value = "connecting";
  source = new EventSource(
    `${env.apiUrl}/api/forecast/stream?locationId=${encodeURIComponent(id.value)}`,
  );
  source.onopen = () => {
    status.value = "streaming";
  };
  source.onmessage = (event) => {
    events.value.push(event.data);
  };
  source.onerror = () => {
    status.value = "unavailable";
    stop();
  };
}

onBeforeUnmount(stop);
</script>

<template>
  <div class="space-y-6">
    <RouterLink
      :to="{ name: 'location', params: { id } }"
      class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft class="h-4 w-4" />
      Back to {{ location?.name ?? "location" }}
    </RouterLink>

    <Card>
      <CardHeader class="flex-row items-center justify-between">
        <CardTitle class="flex items-center gap-2">
          <RadioTower class="h-5 w-5 text-primary" />
          Live forecast stream
          <span class="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
            experimental
          </span>
        </CardTitle>
        <Button
          v-if="status === 'idle' || status === 'unavailable'"
          size="sm"
          @click="start"
        >
          Connect
        </Button>
        <Button v-else size="sm" variant="outline" @click="stop">Stop</Button>
      </CardHeader>
      <CardContent>
        <p v-if="status === 'connecting'" class="text-sm text-muted-foreground">Connecting…</p>

        <EmptyState
          v-else-if="status === 'unavailable'"
          :icon="RadioTower"
          title="Live streaming is not available yet"
          description="The backend returns 501 for the SSE endpoint — this view is a placeholder for the upcoming agent-to-agent streaming phase. Use the daily forecast for now."
        />

        <ul v-else-if="events.length" class="space-y-1 text-sm">
          <li v-for="(line, index) in events" :key="index" class="font-mono">{{ line }}</li>
        </ul>

        <p v-else class="text-sm text-muted-foreground">
          Press connect to attempt a live forecast stream for this location.
        </p>
      </CardContent>
    </Card>
  </div>
</template>
