<script>
  import { onMount } from "svelte";
  import {
    API_URL,
    register,
    login,
    logout,
    getToken,
    getUsername,
    setBudget,
    checkExpense,
    getRemaining,
  } from "./api.js";

  let authed = !!getToken();
  let username = getUsername() ?? "";
  let mode = "login";
  let formUser = "";
  let formPass = "";
  let authError = null;
  let authBusy = false;

  let total = 5000;
  let expense = 1200;
  let status = null;
  let lastResult = null;
  let error = null;

  onMount(() => {
    if (authed) refreshStatus();
  });

  function handleError(e) {
    if (e.status === 401) {
      doLogout();
      authError = "Your session expired — please log in again.";
    } else {
      error = e.message;
    }
  }

  async function submitAuth() {
    authBusy = true;
    authError = null;
    try {
      const fn = mode === "register" ? register : login;
      const data = await fn(formUser.trim(), formPass);
      username = data.username;
      authed = true;
      formPass = "";
      await refreshStatus();
    } catch (e) {
      authError = e.message;
    } finally {
      authBusy = false;
    }
  }

  function doLogout() {
    logout();
    authed = false;
    username = "";
    status = null;
    lastResult = null;
    error = null;
    formUser = "";
    formPass = "";
  }

  async function refreshStatus() {
    error = null;
    try {
      status = await getRemaining();
    } catch (e) {
      handleError(e);
    }
  }

  async function doSet() {
    error = null;
    try {
      status = await setBudget(total);
      lastResult = null;
    } catch (e) {
      handleError(e);
    }
  }

  async function doCheck() {
    error = null;
    try {
      lastResult = await checkExpense(expense);
      status = await getRemaining();
    } catch (e) {
      handleError(e);
    }
  }
</script>

<main>
  <h1>💰 PennyPilot</h1>
  <p class="sub">Keep your trip on budget — talks only to its own backend at <code>{API_URL}</code></p>

  {#if !authed}
    <div class="tabs">
      <button class:active={mode === "login"} on:click={() => { mode = "login"; authError = null; }}>Log in</button>
      <button class:active={mode === "register"} on:click={() => { mode = "register"; authError = null; }}>Register</button>
    </div>

    <form class="auth" on:submit|preventDefault={submitAuth}>
      <label>Username <input bind:value={formUser} autocomplete="username" /></label>
      <label>Password <input type="password" bind:value={formPass} autocomplete={mode === "register" ? "new-password" : "current-password"} /></label>
      <button type="submit" disabled={authBusy}>
        {authBusy ? "…" : mode === "register" ? "Create account" : "Log in"}
      </button>
    </form>

    {#if authError}<p class="error">{authError}</p>{/if}
    <p class="hint">Each user has their own budget, stored in Postgres.</p>
  {:else}
    <div class="userbar">
      <span>Signed in as <strong>{username}</strong></span>
      <button class="link" on:click={doLogout}>Log out</button>
    </div>

    <section>
      <label>Total budget <input type="number" bind:value={total} /></label>
      <button on:click={doSet}>Set budget</button>
    </section>

    <section>
      <label>Expense <input type="number" bind:value={expense} /></label>
      <button on:click={doCheck}>Check expense</button>
      <button on:click={refreshStatus}>Refresh remaining</button>
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

  .tabs { display: flex; gap: 0.25rem; margin: 1rem 0 0.5rem; }
  .tabs button { background: #f1f1f1; border: 1px solid #ddd; padding: 0.4rem 0.9rem; cursor: pointer; border-radius: 6px; }
  .tabs button.active { background: #0a7d28; color: #fff; border-color: #0a7d28; }
  .auth { display: flex; flex-direction: column; gap: 0.6rem; align-items: flex-start; max-width: 280px; }
  .auth input { width: 240px; }
  .hint { color: #888; font-size: 0.85rem; }
  .userbar { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 0.5rem; }
  .link { background: none; border: none; color: #0a55c8; cursor: pointer; text-decoration: underline; padding: 0; }
</style>
