import { useMemo, useState } from "react";
import { CalendarDays, Hotel, Timer, Users } from "lucide-react";
import { PageTitle, Empty } from "@/Layout";
import { useCountdown, useGet } from "@/lib/hooks";
import { taka, cn } from "@/lib/utils";
import { WHATSAPP } from "@/config";

const METHOD = { walking: "walking route", straight: "straight line", unverified: "approx., route not verified" };
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "Date to be confirmed");
const monthKey = (d) => (d ? d.slice(0, 7) : "tbc");
const monthLabel = (k) => (k === "tbc" ? "Date to be confirmed" : new Date(`${k}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }));

// Counts down to the admin's offer_deadline. Isolated so only this small part re-renders every second.
function Countdown({ deadline }) {
  const c = useCountdown(deadline);
  if (!c) return null;
  if (c.over) return <p className="rounded-xl bg-sky px-4 py-3 text-sm text-navy-deep/70">This offer has ended. Ask us for the current price.</p>;
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
    <article className="flex flex-col rounded-2xl border border-mid/30 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-navy px-3 py-1 text-xs text-accent-light">Group Umrah</span>
        <span className={cn("rounded-full px-3 py-1 text-xs", soldOut ? "bg-red-50 text-red-700" : "bg-sky text-navy")}>{soldOut ? "Sold out" : "Seats open"}</span>
      </div>
      <h3 className="mt-4 font-display text-xl text-navy">{p.title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-navy-deep/75">
        <li className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-mid" />{fmtDate(p.departure_date)}{p.duration_days ? ` · ${p.duration_days} days` : ""}</li>
        <li className="flex gap-2"><Hotel size={16} className="mt-0.5 shrink-0 text-mid" />{p.hotel_name || "Hotel to be confirmed"}{p.distance_m ? ` · ${p.distance_m} m (${METHOD[p.distance_method] || METHOD.unverified})` : ""}</li>
        {p.seats_remaining != null && <li className="flex gap-2"><Users size={16} className="mt-0.5 shrink-0 text-mid" />{p.seats_remaining} {p.seats_remaining === 1 ? "seat" : "seats"} left</li>}
      </ul>
      {!soldOut && p.offer_deadline && <div className="mt-4"><Countdown deadline={p.offer_deadline} /></div>}
      <div className="mt-auto pt-6">
        <p className="text-xs text-navy-deep/60">Price per person (estimate)</p>
        <p className="font-display text-2xl text-navy">{p.price_bdt ? taka(Number(p.price_bdt)) : "Price on request"}</p>
        <a href={`#/book?kind=umrah&about=${about}`} className="mt-4 block rounded-full bg-accent py-2.5 text-center text-sm font-medium text-navy-deep transition hover:bg-accent-light">{soldOut ? "Join the waiting list" : "Reserve a seat"}</a>
      </div>
    </article>
  );
}

const Skeleton = () => <div aria-hidden="true" className="h-80 animate-pulse rounded-2xl border border-mid/20 bg-white/70" />;

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
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {months.length > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by month">
            <span className="mr-1 text-xs uppercase tracking-wider text-navy-deep/60">Month</span>
            {["all", ...months].map((m) => (
              <button key={m} aria-pressed={month === m} onClick={() => setMonth(m)} className={cn("rounded-full border px-4 py-1.5 text-sm transition", month === m ? "border-navy bg-navy text-white" : "border-mid/40 bg-white text-navy hover:border-navy")}>{m === "all" ? "All" : monthLabel(m)}</button>
            ))}
          </div>
        )}
        {loading && <div role="status" aria-label="Loading departures" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Skeleton /><Skeleton /><Skeleton /></div>}
        {error && <Empty>We could not load the departures right now. Please try again in a moment, or <a className="text-navy underline" href={WHATSAPP} target="_blank" rel="noopener noreferrer">ask us on WhatsApp</a>.</Empty>}
        {!loading && !error && !shown.length && <Empty>No group Umrah departures are open right now. <a className="text-navy underline" href="#/book?kind=umrah&about=Please%20tell%20me%20about%20the%20next%20group%20Umrah%20departure">Book a call</a> and we will tell you about the next one, or <a className="text-navy underline" href="#/estimate">estimate a private Umrah trip</a>.</Empty>}
        {!!shown.length && <>
          <p className="mb-4 text-sm text-navy-deep/70" role="status">{shown.length} {shown.length === 1 ? "departure" : "departures"}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map((p) => <DepartureCard key={p.id} p={p} />)}</div>
        </>}
        <p className="mt-8 text-xs text-navy-deep/60">Prices are estimates and can change with flights, hotels and exchange rates. A written quotation is provided before any payment.</p>
      </section>
    </>
  );
}
