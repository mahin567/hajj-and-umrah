import { useMemo, useState } from "react";
import { PageTitle, Empty } from "@/Layout";
import { useGet } from "@/lib/hooks";
import { DepartureCard } from "@/components/DepartureCard";
import { Chip, Skeleton, ResultCount } from "@/components/ui/kit";
import { WHATSAPP } from "@/config";

const monthKey = (d) => (d ? d.slice(0, 7) : "tbc");
const monthLabel = (k) => (k === "tbc" ? "Date to be confirmed" : new Date(`${k}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }));

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
