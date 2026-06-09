<script setup>
import { ref } from "vue";
import { API_URL, getForecast } from "./api.js";

const city = ref("London");
const days = ref(5);
const results = ref([]);
const error = ref(null);
const loading = ref(false);

async function search() {
  loading.value = true;
  error.value = null;
  try {
    results.value = await getForecast(city.value, Number(days.value));
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main>
    <h1>🌤️ Weathervane</h1>
    <p class="sub">See the forecast for your trip — talks only to its own backend at <code>{{ API_URL }}</code></p>

    <form @submit.prevent="search">
      <label>City <input v-model="city" placeholder="London" /></label>
      <label>Days <input v-model="days" type="number" min="1" max="5" style="width:70px" /></label>
      <button type="submit" :disabled="loading">{{ loading ? "Loading…" : "Get forecast" }}</button>
    </form>

    <p v-if="error" class="error">Error: {{ error }}</p>

    <ul>
      <li v-for="d in results" :key="d.date" class="card">
        <strong>{{ d.date }}</strong> — {{ d.condition }}
        <span class="meta">high {{ d.high }}°C · low {{ d.low }}°C</span>
      </li>
    </ul>
    <p v-if="!loading && !error && results.length === 0">No forecast yet — run a search.</p>
  </main>
</template>

<style scoped>
main { font-family: system-ui, sans-serif; max-width: 560px; margin: 2rem auto; padding: 0 1rem; }
.sub { color: #555; }
form { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin: 1rem 0; }
ul { list-style: none; padding: 0; display: grid; gap: 0.5rem; }
.card { border: 1px solid #ddd; border-radius: 8px; padding: 0.6rem 1rem; }
.meta { color: #666; font-size: 0.9rem; margin-left: 8px; }
.error { color: #b00020; }
</style>
