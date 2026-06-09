<script>
  import { API_URL, setBudget, checkExpense, getRemaining } from "./api.js";

  let total = 5000;
  let expense = 1200;
  let status = null; // { totalBudget, spent, remaining }
  let lastResult = null; // { approved, remaining, spent }
  let error = null;

  async function doSet() {
    error = null;
    try {
      status = await setBudget(total);
      lastResult = null;
    } catch (e) { error = e.message; }
  }

  async function doCheck() {
    error = null;
    try {
      lastResult = await checkExpense(expense);
      status = await getRemaining();
    } catch (e) { error = e.message; }
  }

  async function doRefresh() {
    error = null;
    try { status = await getRemaining(); } catch (e) { error = e.message; }
  }
</script>

<main>
  <h1>💰 PennyPilot</h1>
  <p class="sub">Keep your trip on budget (stateful) — talks only to its own backend at <code>{API_URL}</code></p>

  <section>
    <label>Total budget <input type="number" bind:value={total} /></label>
    <button on:click={doSet}>Set budget</button>
  </section>

  <section>
    <label>Expense <input type="number" bind:value={expense} /></label>
    <button on:click={doCheck}>Check expense</button>
    <button on:click={doRefresh}>Refresh remaining</button>
  </section>

  {#if error}<p class="error">Error: {error}</p>{/if}

  {#if lastResult}
    <p class="result {lastResult.approved ? 'ok' : 'bad'}">
      Expense {lastResult.approved ? "APPROVED ✅" : "REJECTED ❌"} —
      remaining ${lastResult.remaining.toFixed(2)}
    </p>
  {/if}

  {#if status}
    <div class="card">
      <div>Total: <strong>${status.totalBudget.toFixed(2)}</strong></div>
      <div>Spent: <strong>${status.spent.toFixed(2)}</strong></div>
      <div>Remaining: <strong>${status.remaining.toFixed(2)}</strong></div>
    </div>
  {:else}
    <p>Set a budget to begin.</p>
  {/if}
</main>

<style>
  main { font-family: system-ui, sans-serif; max-width: 560px; margin: 2rem auto; padding: 0 1rem; }
  .sub { color: #555; }
  section { display: flex; gap: 0.5rem; align-items: center; margin: 0.75rem 0; flex-wrap: wrap; }
  input { width: 120px; }
  .card { border: 1px solid #ddd; border-radius: 8px; padding: 0.75rem 1rem; display: grid; gap: 4px; }
  .error { color: #b00020; }
  .result.ok { color: #0a7d28; }
  .result.bad { color: #b00020; }
</style>
