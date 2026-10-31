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
