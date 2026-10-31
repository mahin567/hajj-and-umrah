import { useState } from "react";
import { Check, X, Hotel, Plane, ArrowLeft } from "lucide-react";
import { PACKAGES, ROOM_LABEL, INCLUDED, EXCLUDED, UPGRADES } from "@/data";
import { taka } from "@/lib/utils";
import { PageTitle, ZoneBadge, WHATSAPP } from "@/Layout";

export default function PackageDetail({ slug }) {
  const p = PACKAGES.find((x) => x.slug === slug);
  const occs = p ? Object.keys(p.prices).map(Number).sort((a, b) => a - b) : [];
  const [occ, setOcc] = useState(() => (p && p.prices[4] ? 4 : occs[occs.length - 1]));
  const [vip, setVip] = useState(false);
  const [bus, setBus] = useState(false);
  if (!p) return <section className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl text-navy">Package not found</h1><a href="#/packages" className="mt-4 inline-block text-navy underline">Back to all packages</a></section>;
  const total = p.prices[occ] + (vip ? UPGRADES.vipTent.price : 0) + (bus ? UPGRADES.bus.price : 0);
  const msg = encodeURIComponent(`Assalamu alaikum, I would like a confirmed quotation for: ${p.title}, ${ROOM_LABEL[occ]}${vip ? ", VIP Mina tent" : ""}${bus ? ", dedicated bus" : ""}.`);
  return (
    <>
      <PageTitle eyebrow={`${p.type === "shifting" ? "Shifting" : "Non-shifting"} · ${p.period === "awal" ? "Awal" : "Akhir"} Fatra`} title={p.title}>{p.summary}</PageTitle>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <a href="#/packages" className="inline-flex items-center gap-1 text-sm text-navy hover:text-mid"><ArrowLeft size={16} />All packages</a>
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Makkah", p.makkah, p.mkHotels], ["Madinah", p.madinah, p.mdHotels]].map(([city, d, hotels]) => (
              <div key={city} className="rounded-2xl border border-mid/30 bg-white p-5">
                <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-display text-lg text-navy"><Hotel size={18} className="text-mid" />{city}</h3><ZoneBadge zone={d.zone} /></div>
                {d.zone ? <p className="mt-2 text-sm text-navy-deep/75">{d.min ? `${d.min}–${d.max}` : `Up to ${d.max}`} m from the {city === "Makkah" ? "Haram" : "Masjid an-Nabawi"}. {d.zone.meaning}</p>
                  : <p className="mt-2 text-sm text-navy-deep/75">No separate hotel before the Hajj days. You go straight to Aziziyah.</p>}
                {hotels && <p className="mt-3 text-sm text-navy-deep/60">{hotels}</p>}
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-mid/30 bg-white p-5">
            <h3 className="flex items-center gap-2 font-display text-lg text-navy"><Plane size={18} className="text-mid" />Dates and stay</h3>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="text-navy-deep/60">Total days</dt><dd className="font-medium">{p.days}</dd></div>
              <div><dt className="text-navy-deep/60">Flight window</dt><dd className="font-medium">{p.flight}</dd></div>
              {p.aziziyah > 0 && <div><dt className="text-navy-deep/60">Aziziyah nights</dt><dd className="font-medium">{p.aziziyah}</dd></div>}
              <div><dt className="text-navy-deep/60">Mina–Arafah tent</dt><dd className="font-medium">D category (VIP available)</dd></div>
            </dl>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-mid/30 bg-white p-5"><h3 className="font-display text-lg text-navy">Included</h3>
              <ul className="mt-3 space-y-2 text-sm">{INCLUDED.map((x) => <li key={x} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-mid" />{x}</li>)}</ul></div>
            <div className="rounded-2xl border border-mid/30 bg-white p-5"><h3 className="font-display text-lg text-navy">Not included</h3>
              <ul className="mt-3 space-y-2 text-sm text-navy-deep/75">{EXCLUDED.map((x) => <li key={x} className="flex gap-2"><X size={16} className="mt-0.5 shrink-0 text-navy-deep/40" />{x}</li>)}</ul></div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-mid/30 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h3 className="font-display text-lg text-navy">Your price</h3>
          <fieldset className="mt-4"><legend className="text-xs uppercase tracking-wider text-navy-deep/60">People per room</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">{occs.map((o) => (
              <label key={o} className={`cursor-pointer rounded-xl border px-3 py-2 text-sm ${occ === o ? "border-navy bg-sky" : "border-mid/30"}`}>
                <input type="radio" name="occ" className="sr-only" checked={occ === o} onChange={() => setOcc(o)} />
                <span className="block font-medium text-navy">{ROOM_LABEL[o]}</span><span className="text-navy-deep/70">{taka(p.prices[o])}</span></label>))}</div></fieldset>
          <div className="mt-4 space-y-2 text-sm">
            <label className="flex items-start gap-2"><input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} className="mt-1" /><span>{UPGRADES.vipTent.name} <b className="text-navy">+{taka(UPGRADES.vipTent.price)}</b></span></label>
            {p.type === "shifting" && <label className="flex items-start gap-2"><input type="checkbox" checked={bus} onChange={(e) => setBus(e.target.checked)} className="mt-1" /><span>Dedicated Hajj bus <b className="text-navy">+{taka(UPGRADES.bus.price)}</b></span></label>}
          </div>
          <div className="mt-5 border-t border-mid/20 pt-4"><p className="text-xs text-navy-deep/60">Estimated price per person</p><p className="font-display text-3xl text-navy">{taka(total)}</p></div>
          <a href={`${WHATSAPP}?text=${msg}`} className="mt-4 block rounded-full bg-accent py-3 text-center text-sm font-medium text-navy-deep hover:bg-accent-light">Request confirmed quotation</a>
          <p className="mt-3 text-xs text-navy-deep/60">Prices can change with flights, hotels and exchange rates. You receive a written quotation before any payment.</p>
        </aside>
      </div>
    </>
  );
}
