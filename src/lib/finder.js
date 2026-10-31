// Port of the Django finder scoring (docs/FINDER.md). Pure functions, no I/O.
import { PACKAGES, UPGRADES, zoneFor, ZONES } from "@/data";

export const WEIGHTS = { budget: 25, type: 20, makkah: 20, room: 15, period: 10, madinah: 5, tent: 5 };
export const SETTINGS = { tolerance: 0.10, partial: 0.5, lowMatch: 60, maxMustHaves: 2, alternatives: 2 };
const ZONE_RANK = Object.fromEntries(ZONES.map((z, i) => [z.code, i]));

// 'ok' = full points, 'close' = partial, 'no' = nothing
const score = (kind, ok, partial) => (ok ? { kind: "ok", pts: 1 } : partial ? { kind: "close", pts: SETTINGS.partial } : { kind: "no", pts: 0 });

function zoneScore(want, pkgZone) {
  if (!pkgZone) return score(0, false, false);
  const d = ZONE_RANK[pkgZone.code] - ZONE_RANK[want];
  return score(0, d <= 0, d === 1); // same or closer is a full match
}

function pickRoom(pkg, want) {
  const occ = Object.keys(pkg.prices).map(Number).sort((a, b) => a - b);
  if (!want) return { occ: occ.includes(4) ? 4 : occ[occ.length - 1], res: null };
  const better = occ.filter((o) => o <= want).pop();
  if (better != null) return { occ: better, res: score(0, true) };
  const next = occ.find((o) => o > want);
  return { occ: next, res: score(0, false, next - want === 1) };
}

export function evaluate(pkg, sel, must = []) {
  const lines = [];
  let earned = 0, available = 0, price = 0, upgrades = [];
  const add = (q, label, wanted, r, note) => { lines.push({ q, label, wanted, note, ...r }); available += WEIGHTS[q]; earned += WEIGHTS[q] * r.pts; };

  const room = pickRoom(pkg, sel.room ? Number(sel.room) : null);
  price = pkg.prices[room.occ];
  if (sel.type) add("type", "Package type", sel.type === "shifting" ? "Shifting" : "Non-shifting", score(0, pkg.type === sel.type));
  if (sel.period) add("period", "Travel period", sel.period === "awal" ? "Awal Fatra" : "Akhir Fatra", score(0, pkg.period === sel.period));
  if (sel.makkah) add("makkah", "Distance in Makkah", `Zone ${sel.makkah} or closer`, zoneScore(sel.makkah, pkg.makkah.zone), pkg.makkah.zone ? `Zone ${pkg.makkah.zone.code}` : "No separate Makkah hotel");
  if (sel.madinah) add("madinah", "Distance in Madinah", `Zone ${sel.madinah} or closer`, zoneScore(sel.madinah, pkg.madinah.zone), pkg.madinah.zone ? `Zone ${pkg.madinah.zone.code}` : "");
  if (sel.room) add("room", "People per room", `${sel.room} per room`, room.res, `${room.occ} per room`);
  if (sel.tent) {
    if (sel.tent === "vip") { price += UPGRADES.vipTent.price; upgrades.push(UPGRADES.vipTent); add("tent", "Mina tent", "VIP tent", score(0, true), "Added as an upgrade"); }
    else add("tent", "Mina tent", "Standard tent", score(0, true), "Included");
  }
  if (sel.budget) {
    const ceil = sel.budget.max;
    const r = ceil == null || price <= ceil ? score(0, true) : price <= ceil * (1 + SETTINGS.tolerance) ? score(0, false, true) : score(0, false, false);
    add("budget", "Budget", sel.budget.label, r);
  }
  const unmet = lines.filter((l) => must.includes(l.q) && l.kind !== "ok");
  return {
    pkg, lines, upgrades, roomOcc: room.occ, basePrice: pkg.prices[room.occ], price, excluded: unmet.length > 0,
    percent: available ? Math.round((earned / available) * 100) : 100,
  };
}

export const rank = (sel, must = []) =>
  PACKAGES.map((p) => evaluate(p, sel, must)).filter((r) => !r.excluded).sort((a, b) => b.percent - a.percent || a.price - b.price);

// Only offer answers that at least one live package can honour
export function options() {
  const uniq = (arr) => [...new Set(arr)];
  return {
    type: uniq(PACKAGES.map((p) => p.type)),
    period: uniq(PACKAGES.map((p) => p.period)),
    makkah: uniq(PACKAGES.map((p) => p.makkah.zone?.code).filter(Boolean)).sort(),
    madinah: uniq(PACKAGES.map((p) => p.madinah.zone?.code).filter(Boolean)).sort(),
    room: uniq(PACKAGES.flatMap((p) => Object.keys(p.prices).map(Number))).sort((a, b) => a - b),
  };
}
export { zoneFor };
