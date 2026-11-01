import { useMemo, useState } from "react";
import { Building2, ExternalLink, Search } from "lucide-react";
import { CarouselCard, CarouselSection } from "@/components/ui/carousel-cards";
import { PageTitle, ZoneBadge, Empty } from "@/Layout";
import { HOTELS } from "@/content/hotels";
import { PACKAGES, zoneFor } from "@/data";
import { DIST_METHOD as METHOD } from "@/lib/utils";
import { Chip, FilterBar, SortSelect, ResultCount } from "@/components/ui/kit";

const validCoord = (h) => Number.isFinite(h.lat) && Number.isFinite(h.lng) && Math.abs(h.lat) <= 90 && Math.abs(h.lng) <= 180;
const PLACE = { Makkah: "Masjid al-Haram", Madinah: "Masjid an-Nabawi" };

function HotelCard({ h }) {
  const zone = zoneFor(h.distanceM);
  const used = h.packages.map((p) => p.title.replace(" Hajj", "").replace(" Package", "").replace(" 2027", "")).join(", ");
  return (
    <CarouselCard
      image={h.photos?.[0]}
      imageAlt={`${h.name}, ${h.city}`}
      placeholder={<Building2 size={44} />}
      badge={h.city}
      title={h.name}
      location={h.distanceM != null ? `${h.distanceM} m to ${PLACE[h.city]} (${METHOD[h.method] || METHOD.unverified})` : "Distance being measured"}
      detail={used ? `Used in: ${used}` : undefined}
      footerLeft={zone ? <ZoneBadge zone={zone} /> : <span className="text-navy-deep/70">Zone pending</span>}
      footerRight={validCoord(h)
        ? <a href={`https://www.google.com/maps?q=${h.lat},${h.lng}`} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">Map <ExternalLink size={12} /></a>
        : `${h.packages.length} package${h.packages.length === 1 ? "" : "s"}`}
    />
  );
}

export default function HotelsPage() {
  const [city, setCity] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name");
  // Work out which packages mention each hotel (the brochure names hotels inside the package text)
  const hotels = useMemo(() => HOTELS.map((h) => ({
    ...h,
    packages: PACKAGES.filter((p) => `${p.mkHotels} ${p.mdHotels}`.toLowerCase().includes((h.match || h.name).toLowerCase())),
  })), []);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return hotels
      .filter((h) => (city === "all" || h.city === city) && (!t || h.name.toLowerCase().includes(t)))
      .sort((a, b) => (sort === "distance"
        ? (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity) || a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name)));
  }, [hotels, city, q, sort]);
  return (
    <>
      <PageTitle eyebrow="Where you stay" title="Hotel directory">The hotels used in our packages, with distance to the Haram or Masjid an-Nabawi, photos (once added) and a map link. Distances are labelled by how they were measured. <a href="#/zones" className="link">How zones work</a></PageTitle>
      <section className="wrap page-body">
        <FilterBar>
          <div className="relative md:w-72">
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mid" />
            <input type="search" aria-label="Search hotels" placeholder="Search hotel name" maxLength={60} value={q} onChange={(e) => setQ(e.target.value)} className="field !py-2.5 pl-10" />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="City">
            {[["all", "All"], ["Makkah", "Makkah"], ["Madinah", "Madinah"]].map(([v, l]) => <Chip key={v} on={city === v} onClick={() => setCity(v)}>{l}</Chip>)}
          </div>
          <SortSelect value={sort} onChange={setSort} options={[["name", "Name"], ["distance", "Nearest first"]]} />
        </FilterBar>
        <ResultCount>{list.length} of {hotels.length} hotels</ResultCount>
        {[["Makkah", "Near Masjid al-Haram"], ["Madinah", "Near Masjid an-Nabawi"]].map(([c, sub]) => {
          const items = list.filter((h) => h.city === c);
          return items.length ? (
            <CarouselSection key={c} title={`${c} hotels`} subtitle={`${sub} · ${items.length} ${items.length === 1 ? "hotel" : "hotels"}`}>
              {items.map((h) => <HotelCard key={h.id} h={h} />)}
            </CarouselSection>
          ) : null;
        })}
        {!list.length && <Empty>No hotel matches. Try a different name or show all cities.</Empty>}
        <p className="faint mt-8">Some packages list a hotel “or equivalent”. The hotel you receive is confirmed in your written quotation.</p>
      </section>
    </>
  );
}
