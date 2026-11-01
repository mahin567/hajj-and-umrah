import { useSyncExternalStore } from "react";
import { HOTELS } from "@/content/hotels";

// The hotels a visitor picked for their Umrah estimate. Shared between the Hotels page and the Estimate page,
// and kept for the browser session only (no account, nothing sent to the server).
const KEY = "otw_est_hotels";
const slot = (city) => (city === "Makkah" ? "mk" : "md");
const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch { return {}; } };
let state = load();
const subs = new Set();
const set = (next) => {
  state = next;
  try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage may be blocked */ }
  subs.forEach((f) => f());
};

export const pickHotel = (h) => set({ ...state, [slot(h.city)]: h.id });
export const clearHotel = (city) => set({ ...state, [slot(city)]: null });
export const useEstimateHotels = () => {
  const s = useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state);
  const find = (id) => HOTELS.find((h) => h.id === id) || null; // ignore ids that no longer exist
  return { Makkah: find(s.mk), Madinah: find(s.md) };
};
