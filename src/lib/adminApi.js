import { useCallback, useEffect, useState } from "react";
import { API } from "@/config";

// The admin token lives only in this browser tab (sessionStorage): closing the tab signs you out.
const KEY = "otw_admin_token";
export const getToken = () => { try { return sessionStorage.getItem(KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? sessionStorage.setItem(KEY, t) : sessionStorage.removeItem(KEY); } catch { /* storage blocked */ } };

export async function adminFetch(path, { method = "GET", body } = {}) {
  const token = getToken();
  try {
    const r = await fetch(`${API}/manage${path}`, {
      method,
      credentials: "omit",
      headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Token ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await r.json(); } catch { /* empty body */ }
    if ((r.status === 401 || r.status === 403) && token) { setToken(null); window.dispatchEvent(new Event("admin-logout")); }
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

/** Loads a list once and lets screens patch rows locally. */
export function useList(path) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    const r = await adminFetch(`${path}/`);
    if (r.ok) setItems(Array.isArray(r.data) ? r.data : r.data?.results || []);
    else setError(r.status === 0 ? "Cannot reach the server. Is Django running?" : "Could not load this list.");
  }, [path]);
  useEffect(() => { setItems(null); load(); }, [load]);
  return { items, setItems, error, reload: load };
}
