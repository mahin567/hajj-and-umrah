import { useMemo, useState } from "react";
import { PACKAGES } from "@/data";
import { PageTitle, Empty } from "@/Layout";
import { PackageCard } from "@/components/PackageCard";
import { DepartureCard } from "@/components/DepartureCard";
import { useGet } from "@/lib/hooks";
import { Chip, FilterBar, FilterGroup, SortSelect, ResultCount, Skeleton } from "@/components/ui/kit";

const SORTS = { brochure: (a, b) => a.order - b.order, price: null, days: (a, b) => b.days - a.days || a.order - b.order };

function Hajj() {
  const [type, setType] = useState("all");
  const [period, setPeriod] = useState("all");
  const [occ, setOcc] = useState(null);
  const [sort, setSort] = useState("brochure"); // same order as the brochure by default
  const list = useMemo(() => {
    const r = PACKAGES.filter((p) => (type === "all" || p.type === type) && (period === "all" || p.period === period) && (!occ || p.prices[occ]));
    const cmp = sort === "price" ? (a, b) => (occ ? a.prices[occ] - b.prices[occ] : a.from - b.from) || a.order - b.order : SORTS[sort];
    return [...r].sort(cmp);
  }, [type, period, occ, sort]);
  return (
    <>
      <FilterBar>
        <FilterGroup label="Type">{[["all", "All"], ["shifting", "Shifting"], ["non_shifting", "Non-shifting"]].map(([v, l]) => <Chip key={v} on={type === v} onClick={() => setType(v)}>{l}</Chip>)}</FilterGroup>
        <FilterGroup label="Period">{[["all", "All"], ["awal", "Awal"], ["akhir", "Akhir"]].map(([v, l]) => <Chip key={v} on={period === v} onClick={() => setPeriod(v)}>{l}</Chip>)}</FilterGroup>
        <FilterGroup label="Room">{[null, 5, 4, 3, 2].map((v) => <Chip key={v ?? "any"} on={occ === v} onClick={() => setOcc(v)}>{v ? `${v} per room` : "Any"}</Chip>)}</FilterGroup>
        <SortSelect value={sort} onChange={setSort} options={[["brochure", "Brochure order"], ["price", "Lowest price"], ["days", "Longest stay"]]} />
      </FilterBar>
      <ResultCount>{list.length} of {PACKAGES.length} Hajj packages</ResultCount>
      <div className="grid-cards">
        {list.map((p) => <PackageCard key={p.slug} p={p} occ={occ} />)}
        {!list.length && <p className="panel-empty col-span-full">No package matches these filters. Try “Any” room size, or <a className="link" href="#/find-your-hajj">use the finder</a>.</p>}
      </div>
    </>
  );
}

function Umrah() {
  const { data, loading, error } = useGet("/packages/?kind=umrah");
  const list = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (Array.isArray(data) ? data : [])
      .filter((p) => (p.status === "open" || p.status === "sold_out") && (!p.departure_date || p.departure_date >= today))
      .sort((a, b) => (a.departure_date || "9999").localeCompare(b.departure_date || "9999")); // soonest first
  }, [data]);
  return (
    <>
      <ResultCount>{loading ? "Loading Umrah departures…" : `${list.length} Umrah ${list.length === 1 ? "departure" : "departures"}, soonest first`}</ResultCount>
      {loading && <div className="grid-cards"><Skeleton /><Skeleton /><Skeleton /></div>}
      {error && <Empty>We could not load the Umrah departures right now. Please try again in a moment.</Empty>}
      {!loading && !error && !list.length && <Empty>No group Umrah departures are open right now. <a className="link" href="#/estimate">Estimate a private Umrah trip</a> or <a className="link" href="#/book?kind=umrah">book a call</a>.</Empty>}
      <div className="grid-cards">{list.map((p) => <DepartureCard key={p.id} p={p} />)}</div>
    </>
  );
}

export default function PackagesPage() {
  const [kind, setKind] = useState("hajj");
  return (
    <>
      <PageTitle eyebrow="Hajj 1448 / 2027 and Umrah" title="All packages">Choose Hajj or Umrah, then filter and sort. Prices are per person and change with room size.</PageTitle>
      <section className="wrap page-body">
        <div role="radiogroup" aria-label="Programme" className="mb-4 flex gap-2">
          {[["hajj", "Hajj"], ["umrah", "Umrah"]].map(([v, l]) => <Chip key={v} radio on={kind === v} onClick={() => setKind(v)} className="!px-6 !py-2">{l}</Chip>)}
        </div>
        {kind === "hajj" ? <Hajj /> : <Umrah />}
      </section>
    </>
  );
}
