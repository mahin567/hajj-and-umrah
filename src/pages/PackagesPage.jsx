import { useMemo, useState } from "react";
import { PACKAGES } from "@/data";
import { PageTitle } from "@/Layout";
import { PackageCard } from "@/components/PackageCard";
import { Chip, FilterBar, FilterGroup, SortSelect, ResultCount } from "@/components/ui/kit";

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
      <section className="wrap page-body">
        <FilterBar>
          <FilterGroup label="Type">{[["all", "All"], ["shifting", "Shifting"], ["non_shifting", "Non-shifting"]].map(([v, l]) => <Chip key={v} on={type === v} onClick={() => setType(v)}>{l}</Chip>)}</FilterGroup>
          <FilterGroup label="Period">{[["all", "All"], ["awal", "Awal"], ["akhir", "Akhir"]].map(([v, l]) => <Chip key={v} on={period === v} onClick={() => setPeriod(v)}>{l}</Chip>)}</FilterGroup>
          <FilterGroup label="Room">{[null, 5, 4, 3, 2].map((v) => <Chip key={v ?? "any"} on={occ === v} onClick={() => setOcc(v)}>{v ? `${v} per room` : "Any"}</Chip>)}</FilterGroup>
          <SortSelect value={sort} onChange={setSort} options={[["price", "Lowest price"], ["days", "Longest stay"]]} />
        </FilterBar>
        <ResultCount>{list.length} of {PACKAGES.length} packages</ResultCount>
        <div className="grid-cards">
          {list.map((p) => <PackageCard key={p.slug} p={p} occ={occ} />)}
          {!list.length && <p className="panel-empty col-span-full">No package matches these filters. Try “Any” room size, or <a className="link" href="#/find-your-hajj">use the finder</a>.</p>}
        </div>
      </section>
    </>
  );
}
