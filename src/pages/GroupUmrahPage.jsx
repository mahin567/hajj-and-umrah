import { useMemo, useState } from "react";
import { CalendarDays, Hotel, Timer, Users } from "lucide-react";
import { PageTitle, Empty } from "@/Layout";
import { useCountdown, useGet } from "@/lib/hooks";
import { taka, fmtDate, DIST_METHOD as METHOD } from "@/lib/utils";
import { Chip, Skeleton, LinkButton, ResultCount } from "@/components/ui/kit";
import { WHATSAPP } from "@/config";

const monthKey = (d) => (d ? d.slice(0, 7) : "tbc");
const monthLabel = (k) => (k === "tbc" ? "Date to be confirmed" : new Date(`${k}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }));

// Counts down to the admin's offer_deadline. Isolated so only this small part re-renders every second.
function Countdown({ deadline }) {
  const c = useCountdown(deadline);
  if (!c) return null;
  if (c.over) return <p className="note muted !py-3">This offer has ended. Ask us for the current price.</p>;
  const label = `Offer ends in ${c.d} days, ${c.h} hours, ${c.m} minutes`;
  return (
    <div role="timer" aria-label={label} className="rounded-xl bg-navy-deep px-3 py-3 text-white">
      <p className="mb-2 flex items-center gap-1.5 text-xs text-white/70"><Timer size={14} />Offer ends in</p>
      <div className="grid grid-cols-4 gap-2 text-center" aria-hidden="true">
        {[["d", "days"], ["h", "hrs"], ["m", "min"], ["s", "sec"]].map(([k, l]) => (
          <div key={k}><p className="font-display text-xl tabular-nums leading-none">{String(c[k]).padStart(2, "0")}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/60">{l}</p></div>
        ))}
      </div>
    </div>
  );
}

function DepartureCard({ p }) {
  const soldOut = p.status === "sold_out" || p.seats_remaining === 0;
  const about = encodeURIComponent(`Group Umrah: ${p.title}${p.departure_date ? `, departing ${p.departure_date}` : ""}`.slice(0, 200));
  return (
    <article className="panel panel-lift flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill pill-dark">Group Umrah</span>
        <span className={`pill ${soldOut ? "pill-bad" : "pill-soft"}`}>{soldOut ? "Sold out" : "Seats open"}</span>
      </div>
      <h3 className="mt-4 text-xl">{p.title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-navy-deep/75">
        <li className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-mid" />{fmtDate(p.departure_date)}{p.duration_days ? ` · ${p.duration_days} days` : ""}</li>
        <li className="flex gap-2"><Hotel size={16} className="mt-0.5 shrink-0 text-mid" />{p.hotel_name || "Hotel to be confirmed"}{p.distance_m ? ` · ${p.distance_m} m (${METHOD[p.distance_method] || METHOD.unverified})` : ""}</li>
        {p.seats_remaining != null && <li className="flex gap-2"><Users size={16} className="mt-0.5 shrink-0 text-mid" />{p.seats_remaining} {p.seats_remaining === 1 ? "seat" : "seats"} left</li>}
      </ul>
      {!soldOut && p.offer_deadline && <div className="mt-4"><Countdown deadline={p.offer_deadline} /></div>}
      <div className="mt-auto pt-6">
        <p className="faint">Price per person (estimate)</p>
        <p className="price">{p.price_bdt ? taka(Number(p.price_bdt)) : "Price on request"}</p>
        <LinkButton href={`#/book?kind=umrah&about=${about}`} block className="mt-4">{soldOut ? "Join the waiting list" : "Reserve a seat"}</LinkButton>
      </div>
    </article>
  );
}

export default function GroupUmrahPage() {
  const { data, loading, error } = useGet("/packages/?kind=umrah");
  const [month, setMonth] = useState("all");
  const list = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (Array.isArray(data) ? data : [])
      .filter((p) => (p.status === "open" || p.status === "sold_out") && (!p.departure_date || p.departure_date >= today))
      .sort((a, b) => (a.departure_date || "9999").localeCompare(b.departure_date || "9999"));
  }, [data]);
  const months = useMemo(() => [...new Set(list.map((p) => monthKey(p.departure_date)))], [list]);
  const shown = month === "all" ? list : list.filter((p) => monthKey(p.departure_date) === month);
  return (
    <>
      <PageTitle eyebrow="Fixed departures" title="Group Umrah">Travel with a guided group on a set date. Each departure lists the hotel, distance and price, and shows when a special offer ends.</PageTitle>
      <section className="wrap page-body">
        {months.length > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by month">
            <span className="label mr-1">Month</span>
            {["all", ...months].map((m) => <Chip key={m} on={month === m} onClick={() => setMonth(m)}>{m === "all" ? "All" : monthLabel(m)}</Chip>)}
          </div>
        )}
        {loading && <div role="status" aria-label="Loading departures" className="grid-cards"><Skeleton /><Skeleton /><Skeleton /></div>}
        {error && <Empty>We could not load the departures right now. Please try again in a moment, or <a className="link" href={WHATSAPP} target="_blank" rel="noopener noreferrer">ask us on WhatsApp</a>.</Empty>}
        {!loading && !error && !shown.length && <Empty>No group Umrah departures are open right now. <a className="link" href="#/book?kind=umrah&about=Please%20tell%20me%20about%20the%20next%20group%20Umrah%20departure">Book a call</a> and we will tell you about the next one, or <a className="link" href="#/estimate">estimate a private Umrah trip</a>.</Empty>}
        {!!shown.length && <>
          <ResultCount>{shown.length} {shown.length === 1 ? "departure" : "departures"}</ResultCount>
          <div className="grid-cards">{shown.map((p) => <DepartureCard key={p.id} p={p} />)}</div>
        </>}
        <p className="faint mt-8">Prices are estimates and can change with flights, hotels and exchange rates. A written quotation is provided before any payment.</p>
      </section>
    </>
  );
}
