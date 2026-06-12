<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";

import { Button, Input, Label, NativeSelect, Spinner } from "@/components/ui";
import { CONDITION_LABELS, CONDITIONS, type CurrentInput } from "@/lib/api/models";
import { applyApiError } from "@/lib/utils/applyApiError";

import { useSetCurrentWeather } from "../mutations";
import { currentSchema } from "../schemas";

const props = defineProps<{ locationId: string }>();
const mutation = useSetCurrentWeather();

const { handleSubmit, errors, setErrors, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(currentSchema),
  initialValues: { condition: "SUNNY" },
});

const [tempC] = defineField("tempC");
const [condition] = defineField("condition");
const [humidity] = defineField("humidity");
const [windKph] = defineField("windKph");

const onSubmit = handleSubmit(async (values) => {
  try {
    await mutation.mutateAsync({ id: props.locationId, body: values as CurrentInput });
  } catch (error) {
    applyApiError(error, setErrors);
  }
});
</script>

<template>
  <form class="space-y-4" novalidate @submit="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <Label for="cw-temp">Temperature (°C)</Label>
        <Input id="cw-temp" v-model="tempC" type="number" step="any" />
        <p v-if="errors.tempC" class="text-sm text-destructive">{{ errors.tempC }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="cw-condition">Condition</Label>
        <NativeSelect id="cw-condition" v-model="condition">
          <option v-for="c in CONDITIONS" :key="c" :value="c">{{ CONDITION_LABELS[c] }}</option>
        </NativeSelect>
        <p v-if="errors.condition" class="text-sm text-destructive">{{ errors.condition }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="cw-humidity">Humidity %</Label>
        <Input id="cw-humidity" v-model="humidity" type="number" min="0" max="100" />
        <p v-if="errors.humidity" class="text-sm text-destructive">{{ errors.humidity }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="cw-wind">Wind (km/h)</Label>
        <Input id="cw-wind" v-model="windKph" type="number" min="0" step="any" />
        <p v-if="errors.windKph" class="text-sm text-destructive">{{ errors.windKph }}</p>
      </div>
    </div>

    <div class="flex justify-end">
      <Button type="submit" :disabled="isSubmitting">
        <Spinner v-if="isSubmitting" />
        Save current weather
      </Button>
    </div>
  </form>
</template>
