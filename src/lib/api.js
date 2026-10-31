import { API } from "@/config";

const TIMEOUT_MS = 15000;

// Small fetch wrapper: JSON only, no cookies, hard timeout, never throws on HTTP errors.
export async function request(path, { method = "GET", body, signal } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => ctrl.abort(), { once: true });
  try {
    const r = await fetch(`${API}${path}`, {
      method,
      signal: ctrl.signal,
      credentials: "omit",
      headers: body ? { "Content-Type": "application/json", Accept: "application/json" } : { Accept: "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await r.json(); } catch { /* empty or non-JSON body */ }
    return { ok: r.ok, status: r.status, data };
  } finally {
    clearTimeout(timer);
  }
}

// GET with a short in-memory cache, so moving between pages does not refetch the same list.
const cache = new Map();
export const clearCache = () => cache.clear();
export function getCached(path, ttl = 60_000) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.t < ttl) return Promise.resolve(hit.r);
  return request(path).then((r) => { if (r.ok) cache.set(path, { t: Date.now(), r }); return r; });
}
