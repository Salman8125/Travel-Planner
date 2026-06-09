// Backend base URL: baked at build time from VITE_API_URL (see Dockerfile build ARG).
// Must be http://localhost:<port> — the browser is outside the docker network.
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4003";

async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

export const setBudget = (totalBudget) => post("/set_budget", { totalBudget });
export const checkExpense = (amount) => post("/check_expense", { amount });
export const getRemaining = () => post("/get_remaining_budget", {});
