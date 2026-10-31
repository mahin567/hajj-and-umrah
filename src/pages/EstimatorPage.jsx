import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { EST } from "@/data";
import { taka, cn } from "@/lib/utils";
import { PageTitle, WHATSAPP } from "@/Layout";

const Stepper = ({ label, value, set, min = 0, max = 20, hint }) => (
  <div className="flex items-center justify-between gap-3 py-2">
    <div><p className="text-sm font-medium text-navy">{label}</p>{hint && <p className="text-xs text-navy-deep/60">{hint}</p>}</div>
    <div className="flex items-center gap-2">
      <button aria-label={`Fewer ${label}`} onClick={() => set(Math.max(min, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-mid/40 text-navy"><Minus size={14} /></button>
      <span className="w-6 text-center tabular-nums" aria-live="polite">{value}</span>
      <button aria-label={`More ${label}`} onClick={() => set(Math.min(max, value + 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-mid/40 text-navy"><Plus size={14} /></button>
    </div>
  </div>
);
const Card = ({ title, children }) => <section className="rounded-2xl border border-mid/30 bg-white p-5 md:p-6"><h2 className="mb-2 font-display text-lg text-navy">{title}</h2>{children}</section>;

function compute(s) {
  const { adults, children, infants, occ, mk, md } = s;
  const beds = adults + children, rooms = Math.max(1, Math.ceil(beds / occ));
  const nights = { mk, md, all: mk + md };
  const paying = adults + children * (1 - EST.childDiscountPct / 100) + infants * (EST.infantPct / 100);
  const lines = [];
  const push = (group, label, detail, amount) => amount > 0 && lines.push({ group, label, detail, amount });
  for (const c of EST.choices) {
    const pick = s.choice[c.id]; if (!pick) continue;
    const o = c.options.find((x) => x[0] === pick); const price = o[3];
    if (c.unit === "person") push(c.group, `${c.label}: ${o[1]}`, `${taka(price)} × ${paying % 1 ? paying.toFixed(2) : paying} travellers`, price * paying);
    else if (c.unit === "room-night") push(c.group, `${c.label}: ${o[1]}`, `${taka(price)} × ${rooms} room${rooms > 1 ? "s" : ""} × ${nights[c.nights]} nights`, price * rooms * nights[c.nights]);
    else push(c.group, `${c.label}: ${o[1]}`, `${taka(price)} × ${paying.toFixed(2)} travellers × ${nights[c.nights]} nights`, price * paying * nights[c.nights]);
  }
  for (const f of EST.fixed) push(f.group, f.label, `${taka(f.price)} × ${adults + children + infants}`, f.price * (adults + children + infants));
  for (const t of EST.toggles) if (s.toggle[t.id]) push("Add-ons", t.label, `${taka(t.price)} × ${adults + children}`, t.price * (adults + children));
  for (const q of EST.quantities) if (s.qty[q.id]) push("Add-ons", q.label, `${taka(q.price)} × ${s.qty[q.id]}`, q.price * s.qty[q.id]);
  const sub = lines.reduce((a, l) => a + l.amount, 0);
  const service = sub * EST.serviceChargePct / 100, cont = sub * EST.contingencyPct / 100;
  const total = Math.ceil((sub + service + cont) / EST.rounding) * EST.rounding;
  return { lines, sub, service, cont, total, rooms, perPerson: total / Math.max(1, adults + children + infants) };
}

export default function EstimatorPage() {
  const [s, setS] = useState(() => ({
    adults: 2, children: 0, infants: 0, occ: 2, mk: 10, md: 5,
    choice: Object.fromEntries(EST.choices.filter((c) => c.def).map((c) => [c.id, c.def])), toggle: {}, qty: {},
  }));
  const up = (k) => (v) => setS((p) => ({ ...p, [k]: v }));
  const r = useMemo(() => compute(s), [s]);
  const groups = [...new Set(r.lines.map((l) => l.group))];
  return (
    <>
      <PageTitle eyebrow="Umrah cost estimator" title="Estimate your Umrah">Umrah can be taken any time, for any length, so the price depends on your choices. Change anything and the estimate updates. Hajj is sold at fixed seasonal prices, so use the Hajj finder for that.</PageTitle>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card title="Who is travelling">
            <Stepper label="Adults" value={s.adults} set={(v) => setS((p) => ({ ...p, adults: v }))} min={1} />
            <Stepper label="Children (2–11)" value={s.children} set={up("children")} hint={`${EST.childDiscountPct}% off per-person items`} />
            <Stepper label="Infants (under 2)" value={s.infants} set={up("infants")} hint={`${EST.infantPct}% of the per-person price`} />
            <Stepper label="People per room" value={s.occ} set={up("occ")} min={1} max={5} />
          </Card>
          <Card title="How long">
            <Stepper label="Nights in Makkah" value={s.mk} set={up("mk")} max={40} />
            <Stepper label="Nights in Madinah" value={s.md} set={up("md")} max={40} />
          </Card>
          {EST.choices.map((c) => (
            <Card key={c.id} title={c.label}>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={c.label}>
                {c.optional && <button role="radio" aria-checked={!s.choice[c.id]} onClick={() => setS((p) => ({ ...p, choice: { ...p.choice, [c.id]: null } }))} className={cn("rounded-xl border px-4 py-3 text-left text-sm", !s.choice[c.id] ? "border-navy bg-sky" : "border-mid/30")}><b className="block text-navy">None</b><span className="text-navy-deep/65">Skip this</span></button>}
                {c.options.map(([id, label, sub, price]) => (
                  <button key={id} role="radio" aria-checked={s.choice[c.id] === id} onClick={() => setS((p) => ({ ...p, choice: { ...p.choice, [c.id]: id } }))} className={cn("rounded-xl border px-4 py-3 text-left text-sm transition", s.choice[c.id] === id ? "border-navy bg-sky" : "border-mid/30 hover:border-navy")}>
                    <b className="block text-navy">{label}</b><span className="block text-navy-deep/65">{sub}</span><span className="mt-1 block text-mid">{taka(price)}{c.unit === "person" ? " per person" : c.unit === "room-night" ? " per room per night" : " per person per night"}</span></button>))}
              </div>
            </Card>))}
          <Card title="Add-ons">
            {EST.toggles.map((t) => <label key={t.id} className="flex items-center justify-between gap-3 py-2 text-sm"><span className="flex items-center gap-2"><input type="checkbox" checked={!!s.toggle[t.id]} onChange={(e) => setS((p) => ({ ...p, toggle: { ...p.toggle, [t.id]: e.target.checked } }))} />{t.label}</span><span className="text-navy-deep/65">{taka(t.price)} per person</span></label>)}
            {EST.quantities.map((q) => <Stepper key={q.id} label={q.label} value={s.qty[q.id] || 0} set={(v) => setS((p) => ({ ...p, qty: { ...p.qty, [q.id]: v } }))} hint={`${taka(q.price)} each`} />)}
          </Card>
        </div>

        <aside className="h-fit rounded-2xl border border-mid/30 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-display text-lg text-navy">Your estimate</h2>
          <div className="mt-3 max-h-[46vh] space-y-4 overflow-y-auto pr-1 text-sm">
            {groups.map((g) => (<div key={g}><p className="text-xs uppercase tracking-wider text-mid">{g}</p>
              {r.lines.filter((l) => l.group === g).map((l) => <div key={l.label} className="mt-1.5 flex justify-between gap-3"><div><p className="text-navy">{l.label}</p><p className="text-xs text-navy-deep/55">{l.detail}</p></div><span className="shrink-0 tabular-nums">{taka(l.amount)}</span></div>)}</div>))}
          </div>
          <dl className="mt-4 space-y-1 border-t border-mid/20 pt-3 text-sm text-navy-deep/75">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{taka(r.sub)}</dd></div>
            <div className="flex justify-between"><dt>Service charge ({EST.serviceChargePct}%)</dt><dd>{taka(r.service)}</dd></div>
            <div className="flex justify-between"><dt>Price-change buffer ({EST.contingencyPct}%)</dt><dd>{taka(r.cont)}</dd></div>
          </dl>
          <div className="mt-3 border-t border-mid/20 pt-3"><p className="text-xs text-navy-deep/60">Estimated total for the group · {r.rooms} room{r.rooms > 1 ? "s" : ""}</p><p className="font-display text-3xl text-navy">{taka(r.total)}</p><p className="text-xs text-navy-deep/60">About {taka(r.perPerson)} per person</p></div>
          <a href={`${WHATSAPP}?text=${encodeURIComponent(`I estimated Umrah for ${s.adults} adult(s), ${s.children} child(ren), ${s.infants} infant(s): ${taka(r.total)}. Please send a confirmed quotation.`)}`} className="mt-4 block rounded-full bg-accent py-3 text-center text-sm font-medium text-navy-deep hover:bg-accent-light">Request confirmed quotation</a>
          <p className="mt-3 text-xs text-navy-deep/60">This is an estimate, not an offer. Flights, hotels and exchange rates change.</p>
        </aside>
      </div>
    </>
  );
}
