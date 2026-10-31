import { CalendarDays, MapPin, BedDouble, ArrowRight } from "lucide-react";
import { ROOM_LABEL } from "@/data";
import { taka } from "@/lib/utils";
import { ZoneBadge } from "@/Layout";

export function PackageCard({ p, occ }) {
  const o = occ && p.prices[occ] ? occ : null;
  return (
    <article className="flex flex-col rounded-2xl border border-mid/30 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-navy px-3 py-1 text-xs text-accent-light">{p.type === "shifting" ? "Shifting" : "Non-shifting"}</span>
        <span className="rounded-full bg-sky px-3 py-1 text-xs text-navy">{p.period === "awal" ? "Awal Fatra" : "Akhir Fatra"}</span>
      </div>
      <h3 className="mt-4 font-display text-xl text-navy">{p.title}</h3>
      <p className="mt-2 text-sm text-navy-deep/70">{p.summary}</p>
      <ul className="mt-4 space-y-2 text-sm text-navy-deep/75">
        <li className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-mid" />{p.days} days · {p.flight}</li>
        <li className="flex items-center gap-2"><MapPin size={16} className="shrink-0 text-mid" />Makkah: {p.makkah.zone ? <><ZoneBadge zone={p.makkah.zone} />{p.makkah.max} m</> : "no separate hotel"}</li>
        <li className="flex items-center gap-2"><MapPin size={16} className="shrink-0 text-mid" />Madinah: <ZoneBadge zone={p.madinah.zone} />{p.madinah.max} m</li>
        <li className="flex gap-2"><BedDouble size={16} className="mt-0.5 shrink-0 text-mid" />{Object.keys(p.prices).map((k) => ROOM_LABEL[k]).join(" · ")}</li>
      </ul>
      <div className="mt-auto pt-6">
        <p className="text-xs text-navy-deep/60">{o ? `Price, ${ROOM_LABEL[o]} (estimate)` : "Starting from (estimate)"}</p>
        <p className="font-display text-2xl text-navy">{taka(o ? p.prices[o] : p.from)}</p>
        <a href={`#/packages/${p.slug}`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-medium text-navy-deep transition hover:bg-accent-light">View programme <ArrowRight size={16} /></a>
      </div>
    </article>
  );
}
