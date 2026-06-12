<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed } from "vue";

import { Button, Input, Label, Spinner } from "@/components/ui";
import type { Location, LocationInput } from "@/lib/api/models";
import { applyApiError } from "@/lib/utils/applyApiError";

import { useCreateLocation, useUpdateLocation } from "../mutations";
import { locationSchema } from "../schemas";

const props = defineProps<{ location?: Location | null }>();
const emit = defineEmits<{ saved: []; cancel: [] }>();

const isEdit = computed(() => Boolean(props.location));
const createMutation = useCreateLocation();
const updateMutation = useUpdateLocation();

const { handleSubmit, errors, setErrors, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(locationSchema),
  initialValues: props.location
    ? {
        name: props.location.name,
        city: props.location.city,
        country: props.location.country,
        latitude: props.location.latitude,
        longitude: props.location.longitude,
        timezone: props.location.timezone,
      }
    : { country: "" },
});

const [name] = defineField("name");
const [city] = defineField("city");
const [country] = defineField("country");
const [latitude] = defineField("latitude");
const [longitude] = defineField("longitude");
const [timezone] = defineField("timezone");

const onSubmit = handleSubmit(async (values) => {
  try {
    if (props.location) {
      await updateMutation.mutateAsync({ id: props.location.id, body: values as LocationInput });
    } else {
      await createMutation.mutateAsync(values as LocationInput);
    }
    emit("saved");
  } catch (error) {
    applyApiError(error, setErrors);
  }
});
</script>

<template>
  <form class="space-y-4" novalidate @submit="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5 sm:col-span-2">
        <Label for="loc-name">Name</Label>
        <Input id="loc-name" v-model="name" placeholder="Istanbul" />
        <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="loc-city">City</Label>
        <Input id="loc-city" v-model="city" placeholder="Istanbul" />
        <p v-if="errors.city" class="text-sm text-destructive">{{ errors.city }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="loc-country">Country (ISO-2)</Label>
        <Input id="loc-country" v-model="country" class="uppercase" maxlength="2" placeholder="TR" />
        <p v-if="errors.country" class="text-sm text-destructive">{{ errors.country }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="loc-lat">Latitude</Label>
        <Input id="loc-lat" v-model="latitude" type="number" step="any" placeholder="41.0082" />
        <p v-if="errors.latitude" class="text-sm text-destructive">{{ errors.latitude }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="loc-lon">Longitude</Label>
        <Input id="loc-lon" v-model="longitude" type="number" step="any" placeholder="28.9784" />
        <p v-if="errors.longitude" class="text-sm text-destructive">{{ errors.longitude }}</p>
      </div>
      <div class="space-y-1.5 sm:col-span-2">
        <Label for="loc-tz">Timezone (IANA)</Label>
        <Input id="loc-tz" v-model="timezone" placeholder="Europe/Istanbul" />
        <p v-if="errors.timezone" class="text-sm text-destructive">{{ errors.timezone }}</p>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <Button type="button" variant="outline" @click="emit('cancel')">Cancel</Button>
      <Button type="submit" :disabled="isSubmitting">
        <Spinner v-if="isSubmitting" />
        {{ isEdit ? "Save changes" : "Create location" }}
      </Button>
    </div>
  </form>
</template>
