import { CalendarDays, MapPin, BedDouble, ArrowRight } from "lucide-react";
import { ROOM_LABEL } from "@/data";
import { taka, TYPE_LABEL, PERIOD_LABEL } from "@/lib/utils";
import { LinkButton } from "@/components/ui/kit";
import { ZoneBadge } from "@/Layout";

export function PackageCard({ p, occ }) {
  const o = occ && p.prices[occ] ? occ : null;
  return (
    <article className="panel panel-lift flex flex-col">
      <div className="flex flex-wrap gap-2">
        <span className="pill pill-dark">{TYPE_LABEL[p.type]}</span>
        <span className="pill pill-soft">{PERIOD_LABEL[p.period]} Fatra</span>
      </div>
      <h3 className="mt-4 text-xl">{p.title}</h3>
      <p className="muted mt-2 text-sm">{p.summary}</p>
      <ul className="mt-4 space-y-2 text-sm text-navy-deep/75">
        <li className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-mid" />{p.days} days · {p.flight}</li>
        <li className="flex items-center gap-2"><MapPin size={16} className="shrink-0 text-mid" />Makkah: {p.makkah.zone ? <><ZoneBadge zone={p.makkah.zone} />{p.makkah.max} m</> : "no separate hotel"}</li>
        <li className="flex items-center gap-2"><MapPin size={16} className="shrink-0 text-mid" />Madinah: <ZoneBadge zone={p.madinah.zone} />{p.madinah.max} m</li>
        <li className="flex gap-2"><BedDouble size={16} className="mt-0.5 shrink-0 text-mid" />{Object.keys(p.prices).map((k) => ROOM_LABEL[k]).join(" · ")}</li>
      </ul>
      <div className="mt-auto pt-6">
        <p className="faint">{o ? `Price, ${ROOM_LABEL[o]} (estimate)` : "Starting from (estimate)"}</p>
        <p className="price">{taka(o ? p.prices[o] : p.from)}</p>
        <LinkButton href={`#/packages/${p.slug}`} block small className="mt-4">View programme <ArrowRight size={16} /></LinkButton>
      </div>
    </article>
  );
}
