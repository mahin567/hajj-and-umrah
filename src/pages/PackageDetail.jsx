import { useState } from "react";
import { Check, X, Hotel, Plane, ArrowLeft } from "lucide-react";
import { PACKAGES, ROOM_LABEL, INCLUDED, EXCLUDED, UPGRADES } from "@/data";
import { taka, TYPE_LABEL, PERIOD_LABEL } from "@/lib/utils";
import { PageTitle, ZoneBadge, WHATSAPP } from "@/Layout";
import { LinkButton } from "@/components/ui/kit";

export default function PackageDetail({ slug }) {
  const p = PACKAGES.find((x) => x.slug === slug);
  const occs = p ? Object.keys(p.prices).map(Number).sort((a, b) => a - b) : [];
  const [occ, setOcc] = useState(() => (p && p.prices[4] ? 4 : occs[occs.length - 1]));
  const [vip, setVip] = useState(false);
  const [bus, setBus] = useState(false);
  if (!p) return <section className="wrap-sm section text-center"><h1 id="page-title" tabIndex={-1} className="text-3xl outline-none">Package not found</h1><a href="#/packages" className="link mt-4 inline-block">Back to all packages</a></section>;
  const total = p.prices[occ] + (vip ? UPGRADES.vipTent.price : 0) + (bus ? UPGRADES.bus.price : 0);
  const msg = encodeURIComponent(`Assalamu alaikum, I would like a confirmed quotation for: ${p.title}, ${ROOM_LABEL[occ]}${vip ? ", VIP Mina tent" : ""}${bus ? ", dedicated bus" : ""}.`);
  return (
    <>
      <PageTitle eyebrow={`${TYPE_LABEL[p.type]} · ${PERIOD_LABEL[p.period]} Fatra`} title={p.title}>{p.summary}</PageTitle>
      <div className="wrap page-body grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <a href="#/packages" className="btn-text !gap-1"><ArrowLeft size={16} />All packages</a>
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Makkah", p.makkah, p.mkHotels], ["Madinah", p.madinah, p.mdHotels]].map(([city, d, hotels]) => (
              <div key={city} className="panel">
                <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-lg"><Hotel size={18} className="text-mid" />{city}</h3><ZoneBadge zone={d.zone} /></div>
                {d.zone ? <p className="muted mt-2 text-sm">{d.min ? `${d.min}–${d.max}` : `Up to ${d.max}`} m from the {city === "Makkah" ? "Haram" : "Masjid an-Nabawi"}. {d.zone.meaning}</p>
                  : <p className="muted mt-2 text-sm">No separate hotel before the Hajj days. You go straight to Aziziyah.</p>}
                {hotels && <p className="faint mt-3 text-sm">{hotels}</p>}
              </div>
            ))}
          </div>
          <div className="panel">
            <h3 className="flex items-center gap-2 text-lg"><Plane size={18} className="text-mid" />Dates and stay</h3>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="text-navy-deep/70">Total days</dt><dd className="font-medium">{p.days}</dd></div>
              <div><dt className="text-navy-deep/70">Flight window</dt><dd className="font-medium">{p.flight}</dd></div>
              {p.aziziyah > 0 && <div><dt className="text-navy-deep/70">Aziziyah nights</dt><dd className="font-medium">{p.aziziyah}</dd></div>}
              <div><dt className="text-navy-deep/70">Mina–Arafah tent</dt><dd className="font-medium">D category (VIP available)</dd></div>
            </dl>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel"><h3 className="text-lg">Included</h3>
              <ul className="mt-3 space-y-2 text-sm">{INCLUDED.map((x) => <li key={x} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-mid" />{x}</li>)}</ul></div>
            <div className="panel"><h3 className="text-lg">Not included</h3>
              <ul className="mt-3 space-y-2 text-sm text-navy-deep/75">{EXCLUDED.map((x) => <li key={x} className="flex gap-2"><X size={16} className="mt-0.5 shrink-0 text-navy-deep/40" />{x}</li>)}</ul></div>
          </div>
        </div>

        <aside className="panel panel-lift h-fit lg:sticky lg:top-24">
          <h2 className="text-lg">Your price</h2>
          <fieldset className="mt-4"><legend className="label">People per room</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">{occs.map((o) => (
              <label key={o} className={`choice cursor-pointer !px-3 !py-2 ${occ === o ? "is-on" : ""}`}>
                <input type="radio" name="occ" className="sr-only" checked={occ === o} onChange={() => setOcc(o)} />
                <span className="block font-medium text-navy">{ROOM_LABEL[o]}</span><span className="muted">{taka(p.prices[o])}</span></label>))}</div></fieldset>
          <div className="mt-4 space-y-2 text-sm">
            <label className="flex items-start gap-2"><input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} className="mt-1" /><span>{UPGRADES.vipTent.name} <b className="text-navy">+{taka(UPGRADES.vipTent.price)}</b></span></label>
            {p.type === "shifting" && <label className="flex items-start gap-2"><input type="checkbox" checked={bus} onChange={(e) => setBus(e.target.checked)} className="mt-1" /><span>Dedicated Hajj bus <b className="text-navy">+{taka(UPGRADES.bus.price)}</b></span></label>}
          </div>
          <div className="mt-5 border-t border-mid/20 pt-4"><p className="faint">Estimated price per person</p><p className="price !text-3xl">{taka(total)}</p></div>
          <LinkButton href={`${WHATSAPP}?text=${msg}`} target="_blank" rel="noopener noreferrer" block className="mt-4">Request confirmed quotation</LinkButton>
          <p className="faint mt-3">Prices can change with flights, hotels and exchange rates. You receive a written quotation before any payment.</p>
        </aside>
      </div>
    </>
  );
}
