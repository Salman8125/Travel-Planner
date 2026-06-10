export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4003";

const TOKEN_KEY = "pennypilot_token";
const USER_KEY = "pennypilot_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUsername = () => localStorage.getItem(USER_KEY);

function setAuth(token, username) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(path, { body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers["Authorization"] = `Token ${t}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const detail = (data && (data.detail || JSON.stringify(data))) || `request failed (${res.status})`;
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function register(username, password) {
  const data = await request("/register", { body: { username, password } });
  setAuth(data.token, data.username);
  return data;
}

export async function login(username, password) {
  const data = await request("/login", { body: { username, password } });
  setAuth(data.token, data.username);
  return data;
}

export function logout() {
  clearAuth();
}

export const setBudget = (totalBudget) =>
  request("/set_budget", { body: { totalBudget }, auth: true });
export const checkExpense = (amount) =>
  request("/check_expense", { body: { amount }, auth: true });
export const getRemaining = () =>
  request("/get_remaining_budget", { body: {}, auth: true });
