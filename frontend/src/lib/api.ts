// ── API Abstraction Layer ─────────────────────────────────────
// Replace the placeholder below with your deployed GAS Web App URL.
// Deploy from: script.google.com → Deploy → New deployment → Web App
// Execute as: Me | Access: Anyone
// ─────────────────────────────────────────────────────────────

const API_URL = "https://script.google.com/macros/s/AKfycbzyDpwHctOt7OKa2iJZKbifzLucD9gnFoJYF-XLPmaqZWoU1QVX-7JzDv_awVfnp0RrTA/exec";

export async function api(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // prevents CORS preflight with GAS
    body: JSON.stringify({ action, ...payload }),
    redirect: "follow", // required for GAS redirects
  });

  if (!res.ok) {
    throw new Error(`Request failed: HTTP ${res.status}`);
  }

  const data = await res.json();
  return data as Record<string, unknown>;
}
