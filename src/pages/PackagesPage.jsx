import { useMemo, useState } from "react";
import { PACKAGES } from "@/data";
import { cn } from "@/lib/utils";
import { PageTitle } from "@/Layout";
import { PackageCard } from "@/components/PackageCard";

const Chip = ({ on, children, ...p }) => (
  <button {...p} aria-pressed={on} className={cn("rounded-full border px-4 py-1.5 text-sm transition", on ? "border-navy bg-navy text-white" : "border-mid/40 bg-white text-navy hover:border-navy")}>{children}</button>
);

export default function PackagesPage() {
  const [type, setType] = useState("all");
  const [period, setPeriod] = useState("all");
  const [occ, setOcc] = useState(null);
  const [sort, setSort] = useState("price");
  const list = useMemo(() => {
    let r = PACKAGES.filter((p) => (type === "all" || p.type === type) && (period === "all" || p.period === period) && (!occ || p.prices[occ]));
    r = [...r].sort((a, b) => (sort === "price" ? (occ ? a.prices[occ] - b.prices[occ] : a.from - b.from) : b.days - a.days));
    return r;
  }, [type, period, occ, sort]);
  return (
    <>
      <PageTitle eyebrow="Hajj 1448 / 2027" title="All packages">Filter by package type, travel period and room size. Prices are per person and change with room size.</PageTitle>
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-mid/30 bg-white p-4 md:flex-row md:flex-wrap md:items-center md:gap-8">
          <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs uppercase tracking-wider text-navy-deep/60">Type</span>
            {[["all", "All"], ["shifting", "Shifting"], ["non_shifting", "Non-shifting"]].map(([v, l]) => <Chip key={v} on={type === v} onClick={() => setType(v)}>{l}</Chip>)}</div>
          <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs uppercase tracking-wider text-navy-deep/60">Period</span>
            {[["all", "All"], ["awal", "Awal"], ["akhir", "Akhir"]].map(([v, l]) => <Chip key={v} on={period === v} onClick={() => setPeriod(v)}>{l}</Chip>)}</div>
          <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs uppercase tracking-wider text-navy-deep/60">Room</span>
            {[null, 5, 4, 3, 2].map((v) => <Chip key={v ?? "any"} on={occ === v} onClick={() => setOcc(v)}>{v ? `${v} per room` : "Any"}</Chip>)}</div>
          <label className="ml-auto flex items-center gap-2 text-sm text-navy-deep/70">Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-mid/40 bg-white px-3 py-1.5 text-navy">
              <option value="price">Lowest price</option><option value="days">Longest stay</option></select></label>
        </div>
        <p className="mt-4 text-sm text-navy-deep/70" role="status">{list.length} of {PACKAGES.length} packages</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => <PackageCard key={p.slug} p={p} occ={occ} />)}
          {!list.length && <p className="col-span-full rounded-2xl border border-dashed border-mid/60 bg-white p-8 text-center text-navy-deep/70">No package matches these filters. Try “Any” room size, or <a className="text-navy underline" href="#/find-your-hajj">use the finder</a>.</p>}
        </div>
      </section>
    </>
  );
}
