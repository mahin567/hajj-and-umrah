import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => twMerge(clsx(inputs));

// Bangladeshi digit grouping: 8,95,000
export const taka = (n) => (n == null ? "Price on request" : `৳ ${Math.round(n).toLocaleString("en-IN")}`);

// Only allow real https links from config/API data (blocks javascript: and other schemes)
export const safeHttps = (u) => {
  try { const x = new URL(u); return x.protocol === "https:" ? x.href : ""; } catch { return ""; }
};
export const waLink = (base, text) => `${base}?text=${encodeURIComponent(text)}`;

// Labels used by every package card, so they read the same on every page
export const TYPE_LABEL = { shifting: "Shifting", non_shifting: "Non-shifting" };
export const PERIOD_LABEL = { awal: "Awal", akhir: "Akhir" };
export const DIST_METHOD = { walking: "walking route", straight: "straight line", unverified: "approx., route not verified" };
export const fmtDate = (d, month = "long") => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month, year: "numeric", timeZone: "UTC" }) : "Date to be confirmed");
