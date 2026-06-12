<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";

import { Button, Input, Label, NativeSelect, Spinner } from "@/components/ui";
import { CONDITION_LABELS, CONDITIONS, type DailyForecastInput } from "@/lib/api/models";
import { todayISO } from "@/lib/utils/date";
import { applyApiError } from "@/lib/utils/applyApiError";

import { useUpsertForecast } from "../mutations";
import { forecastSchema } from "../schemas";

const props = defineProps<{ locationId: string }>();
const mutation = useUpsertForecast();

const { handleSubmit, errors, setErrors, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(forecastSchema),
  initialValues: { date: todayISO(), condition: "SUNNY" },
});

const [date] = defineField("date");
const [high] = defineField("high");
const [low] = defineField("low");
const [condition] = defineField("condition");
const [precipitationChance] = defineField("precipitationChance");
const [humidity] = defineField("humidity");
const [windKph] = defineField("windKph");

const onSubmit = handleSubmit(async (values) => {
  try {
    await mutation.mutateAsync({ id: props.locationId, body: values as DailyForecastInput });
  } catch (error) {
    applyApiError(error, setErrors);
  }
});
</script>

<template>
  <form class="space-y-4" novalidate @submit="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <Label for="fc-date">Date</Label>
        <Input id="fc-date" v-model="date" type="date" />
        <p v-if="errors.date" class="text-sm text-destructive">{{ errors.date }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="fc-condition">Condition</Label>
        <NativeSelect id="fc-condition" v-model="condition">
          <option v-for="c in CONDITIONS" :key="c" :value="c">{{ CONDITION_LABELS[c] }}</option>
        </NativeSelect>
        <p v-if="errors.condition" class="text-sm text-destructive">{{ errors.condition }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="fc-high">High (°C)</Label>
        <Input id="fc-high" v-model="high" type="number" step="any" />
        <p v-if="errors.high" class="text-sm text-destructive">{{ errors.high }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="fc-low">Low (°C)</Label>
        <Input id="fc-low" v-model="low" type="number" step="any" />
        <p v-if="errors.low" class="text-sm text-destructive">{{ errors.low }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="fc-precip">Precipitation %</Label>
        <Input id="fc-precip" v-model="precipitationChance" type="number" min="0" max="100" />
        <p v-if="errors.precipitationChance" class="text-sm text-destructive">
          {{ errors.precipitationChance }}
        </p>
      </div>
      <div class="space-y-1.5">
        <Label for="fc-humidity">Humidity %</Label>
        <Input id="fc-humidity" v-model="humidity" type="number" min="0" max="100" />
        <p v-if="errors.humidity" class="text-sm text-destructive">{{ errors.humidity }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="fc-wind">Wind (km/h)</Label>
        <Input id="fc-wind" v-model="windKph" type="number" min="0" step="any" />
        <p v-if="errors.windKph" class="text-sm text-destructive">{{ errors.windKph }}</p>
      </div>
    </div>

    <div class="flex justify-end">
      <Button type="submit" :disabled="isSubmitting">
        <Spinner v-if="isSubmitting" />
        Save forecast day
      </Button>
    </div>
  </form>
</template>
