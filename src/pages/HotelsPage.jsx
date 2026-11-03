import { useMemo, useState } from "react";
import { Building2, ExternalLink, Search } from "lucide-react";
import { CarouselCard, CarouselSection } from "@/components/ui/carousel-cards";
import { PageTitle, ZoneBadge, Empty } from "@/Layout";
import { HOTELS } from "@/content/hotels";
import { PACKAGES, zoneFor } from "@/data";
import { DIST_METHOD as METHOD } from "@/lib/utils";
import { Chip, FilterBar, SortSelect, ResultCount } from "@/components/ui/kit";

const validCoord = (h) => Number.isFinite(h.lat) && Number.isFinite(h.lng) && Math.abs(h.lat) <= 90 && Math.abs(h.lng) <= 180;
// Until a hotel has its own photos (set `photos` in content/hotels.js), the card shows a photo of the area. These are not the hotel itself.
const AREA = { Makkah: ["hero-3", "hero-5", "hero-1"], Madinah: ["hero-2", "hero-4"] };
const PLACE = { Makkah: "Masjid al-Haram", Madinah: "Masjid an-Nabawi" };

const siteFor = (h) => h.website || `https://www.google.com/search?q=${encodeURIComponent(`${h.name} ${h.city} hotel official website`)}`;

function HotelCard({ h, i }) {
  const own = h.photos?.[0];
  const area = AREA[h.city][i % AREA[h.city].length];
  const zone = zoneFor(h.distanceM);
  const short = (p) => p.title.replace(" Hajj", "").replace(" Package", "").replace(" 2027", "");
  const used = (
    <>
      <span className="mb-1 block font-semibold text-navy-deep">{h.packages.length ? "Included in these packages:" : "Not named in a package yet"}</span>
      <span className="flex flex-wrap gap-1.5">
        {h.packages.map((p) => (
          <a key={p.slug} href={`#/packages/${p.slug}`} className="rounded-full bg-sky px-2.5 py-0.5 text-xs font-medium text-navy transition-colors hover:bg-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{short(p)}</a>
        ))}
      </span>
    </>
  );
  return (
    <CarouselCard
      image={own || `/media/${area}-900.webp`}
      imageAlt={own ? `${h.name}, ${h.city}` : `${h.city} area (photo of the area, not the hotel)`}
      placeholder={<Building2 size={44} />}
      badge={own ? h.city : `${h.city} · area photo`}
      titleHref={siteFor(h)}
      imageHref={siteFor(h)}
      title={h.name}
      tall
      detail={used}
      location={h.distanceM != null ? `${h.distanceM} m to ${PLACE[h.city]} (${METHOD[h.method] || METHOD.unverified})` : "Distance being measured"}
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
              {items.map((h, i) => <HotelCard key={h.id} h={h} i={i} />)}
            </CarouselSection>
          ) : null;
        })}
        {!list.length && <Empty>No hotel matches. Try a different name or show all cities.</Empty>}
        <section className="mt-12" aria-labelledby="pkg-hotels">
          <h2 id="pkg-hotels" className="text-2xl md:text-3xl">Which package includes which hotel</h2>
          <p className="muted mt-2 max-w-2xl">Open any package to see its full programme, prices and room options.</p>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-mid/25 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-sky text-navy-deep"><tr><th className="p-3 font-semibold">Package</th><th className="p-3 font-semibold">Makkah hotels</th><th className="p-3 font-semibold">Madinah hotels</th><th className="p-3"><span className="sr-only">Details</span></th></tr></thead>
              <tbody className="divide-y divide-mid/15">
                {PACKAGES.map((p) => (
                  <tr key={p.slug} className="align-top">
                    <th scope="row" className="p-3 font-semibold text-navy"><a href={`#/packages/${p.slug}`} className="link">{p.title}</a></th>
                    <td className="p-3 text-navy-deep/80">{p.mkHotels || "No separate Makkah hotel before Hajj"}</td>
                    <td className="p-3 text-navy-deep/80">{p.mdHotels}</td>
                    <td className="p-3 text-right"><a href={`#/packages/${p.slug}`} className="btn btn-navy btn-sm whitespace-nowrap">View package</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <p className="faint mt-8">Some packages list a hotel “or equivalent”. The hotel you receive is confirmed in your written quotation.</p>
      </section>
    </>
  );
}
