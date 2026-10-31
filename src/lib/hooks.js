import { useEffect, useState } from "react";
import { getCached } from "@/lib/api";

// { data, loading, error } for a GET endpoint
export function useGet(path) {
  const [s, setS] = useState({ data: null, loading: true, error: false });
  useEffect(() => {
    let dead = false;
    setS({ data: null, loading: true, error: false });
    getCached(path)
      .then((r) => !dead && setS(r.ok ? { data: r.data, loading: false, error: false } : { data: null, loading: false, error: true }))
      .catch(() => !dead && setS({ data: null, loading: false, error: true }));
    return () => { dead = true; };
  }, [path]);
  return s;
}

// Live countdown to an ISO date-time. Returns null if there is no valid deadline.
export function useCountdown(iso) {
  const end = iso ? new Date(iso).getTime() : NaN;
  const valid = Number.isFinite(end);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!valid) return;
    setNow(Date.now());
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= end) clearInterval(id); // stop ticking once the offer is over
    }, 1000);
    return () => clearInterval(id);
  }, [end, valid]);
  if (!valid) return null;
  const ms = Math.max(0, end - now);
  const t = Math.floor(ms / 1000);
  return { over: ms === 0, d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}

// #/book?kind=umrah → { kind: "umrah" }
export function hashQuery() {
  const q = typeof location === "undefined" ? "" : location.hash.split("?")[1] || "";
  return Object.fromEntries(new URLSearchParams(q));
}
