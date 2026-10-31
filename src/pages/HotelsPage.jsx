import { useMemo, useState } from "react";
import { Building2, ExternalLink, MapPin, Search } from "lucide-react";
import { PageTitle, ZoneBadge, Empty } from "@/Layout";
import { HOTELS } from "@/content/hotels";
import { PACKAGES, zoneFor } from "@/data";
import { cn } from "@/lib/utils";

const METHOD = { walking: "walking route", straight: "straight line", unverified: "approx., route not verified" };
const PAGE = 12;
const validCoord = (h) => Number.isFinite(h.lat) && Number.isFinite(h.lng) && Math.abs(h.lat) <= 90 && Math.abs(h.lng) <= 180;
const PLACE = { Makkah: "Masjid al-Haram", Madinah: "Masjid an-Nabawi" };

// Map loads only when the person opens "Show map", so the list stays fast.
function MapEmbed({ h }) {
  const d = 0.004;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${h.lng - d}%2C${h.lat - d}%2C${h.lng + d}%2C${h.lat + d}&layer=mapnik&marker=${h.lat}%2C${h.lng}`;
  return (
    <div className="mt-3">
      <iframe title={`Map of ${h.name}`} src={src} loading="lazy" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin" className="h-56 w-full rounded-xl border border-mid/30" />
      <a href={`https://www.google.com/maps?q=${h.lat},${h.lng}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-navy underline">Open in Google Maps <ExternalLink size={12} /></a>
    </div>
  );
}

function HotelCard({ h }) {
  const [map, setMap] = useState(false);
  const zone = zoneFor(h.distanceM);
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-mid/30 bg-white shadow-sm">
      {h.photos?.length
        ? <img src={h.photos[0]} alt={`${h.name}, ${h.city}`} loading="lazy" decoding="async" width="640" height="400" className="aspect-[16/10] w-full object-cover" />
        : <div aria-hidden="true" className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-sky to-white text-mid/60"><Building2 size={44} /></div>}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-navy px-3 py-1 text-xs text-accent-light">{h.city}</span>
          <ZoneBadge zone={zone} />
        </div>
        <h3 className="mt-3 font-display text-xl text-navy">{h.name}</h3>
        <p className="mt-2 flex items-start gap-2 text-sm text-navy-deep/75"><MapPin size={16} className="mt-0.5 shrink-0 text-mid" />
          {h.distanceM != null ? `${h.distanceM} m to ${PLACE[h.city]} (${METHOD[h.method] || METHOD.unverified})` : "Distance being measured"}</p>
        {h.packages.length > 0 && (
          <p className="mt-3 text-xs text-navy-deep/65">Used in: {h.packages.map((p, i) => <span key={p.slug}>{i > 0 && ", "}<a className="text-navy underline" href={`#/packages/${p.slug}`}>{p.title.replace(" Hajj", "").replace(" Package", "").replace(" 2027", "")}</a></span>)}</p>
        )}
        {validCoord(h) && (<div className="mt-auto pt-4">
          <button onClick={() => setMap(!map)} aria-expanded={map} className="text-sm font-medium text-navy hover:text-mid">{map ? "Hide map" : "Show map"}</button>
          {map && <MapEmbed h={h} />}
        </div>)}
      </div>
    </article>
  );
}

export default function HotelsPage() {
  const [city, setCity] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name");
  const [limit, setLimit] = useState(PAGE);
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
  const reset = (fn) => (v) => { fn(v); setLimit(PAGE); };
  return (
    <>
      <PageTitle eyebrow="Where you stay" title="Hotel directory">The hotels used in our packages, with distance to the Haram or Masjid an-Nabawi, photos and a map. Distances are labelled by how they were measured. <a href="#/zones" className="text-navy underline">How zones work</a></PageTitle>
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-mid/30 bg-white p-4 md:flex-row md:items-center md:gap-6">
          <div className="relative md:w-72">
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mid" />
            <input type="search" aria-label="Search hotels" placeholder="Search hotel name" maxLength={60} value={q} onChange={(e) => reset(setQ)(e.target.value)} className="w-full rounded-xl border border-mid/40 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-mid focus:outline-none focus:ring-2 focus:ring-mid/40" />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="City">
            {[["all", "All"], ["Makkah", "Makkah"], ["Madinah", "Madinah"]].map(([v, l]) => (
              <button key={v} aria-pressed={city === v} onClick={() => reset(setCity)(v)} className={cn("rounded-full border px-4 py-1.5 text-sm transition", city === v ? "border-navy bg-navy text-white" : "border-mid/40 bg-white text-navy hover:border-navy")}>{l}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-navy-deep/70 md:ml-auto">Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-mid/40 bg-white px-3 py-1.5 text-navy">
              <option value="name">Name</option><option value="distance">Nearest first</option></select></label>
        </div>
        <p className="mt-4 text-sm text-navy-deep/70" role="status">{list.length} of {hotels.length} hotels</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, limit).map((h) => <HotelCard key={h.id} h={h} />)}
          {!list.length && <div className="col-span-full"><Empty>No hotel matches. Try a different name or show all cities.</Empty></div>}
        </div>
        {list.length > limit && <div className="mt-8 text-center"><button onClick={() => setLimit(limit + PAGE)} className="rounded-full border border-navy px-6 py-2.5 text-sm text-navy hover:bg-sky">Show more hotels</button></div>}
        <p className="mt-8 text-xs text-navy-deep/60">Some packages list a hotel “or equivalent”. The hotel you receive is confirmed in your written quotation.</p>
      </section>
    </>
  );
}
