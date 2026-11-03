import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Minus, Plus } from "lucide-react";
import { EST } from "@/data";
import { taka, cn } from "@/lib/utils";
import { PageTitle, WHATSAPP } from "@/Layout";
import { LinkButton } from "@/components/ui/kit";

const Stepper = ({ label, value, set, min = 0, max = 20, hint }) => (
  <div className="flex items-center justify-between gap-3 py-2">
    <div><p className="text-sm font-medium text-navy">{label}</p>{hint && <p className="faint">{hint}</p>}</div>
    <div className="flex items-center gap-2">
      <button aria-label={`Fewer ${label}`} onClick={() => set(Math.max(min, value - 1))} type="button" className="round-btn !h-8 !w-8"><Minus size={14} /></button>
      <span className="w-6 text-center tabular-nums" aria-live="polite">{value}</span>
      <button aria-label={`More ${label}`} onClick={() => set(Math.min(max, value + 1))} type="button" className="round-btn !h-8 !w-8"><Plus size={14} /></button>
    </div>
  </div>
);

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

/* One numbered row. Click to open its controls; only one row is open at a time (same pattern as the features-with-panel block). */
function Step({ n, title, summary, open, onOpen, onNext, last, children }) {
  return (
    <li className={cn("rounded-2xl bg-white/90 ring-1 transition-all duration-200", open ? "shadow-md ring-2 ring-navy" : "ring-mid/25 hover:ring-mid/60")}>
      <button type="button" aria-expanded={open} aria-controls={`est-step-${n}`} onClick={onOpen} className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left">
        <span aria-hidden="true" className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200", open ? "bg-navy text-white" : "bg-sky text-navy")}>{n}</span>
        <span className="min-w-0 flex-1">
          <span className={cn("block font-semibold transition-colors", open ? "text-navy-deep" : "text-navy")}>{title}</span>
          {!open && summary && <span className="faint block truncate">{summary}</span>}
        </span>
        <ChevronDown size={20} aria-hidden="true" className={cn("shrink-0 text-navy transition-transform duration-300", open && "rotate-180")} />
      </button>
      <div id={`est-step-${n}`} role="region" aria-label={title} className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4" inert={open ? undefined : ""}>
            <div className="border-t border-mid/20 pt-3">{children}</div>
            {!last && <button type="button" onClick={onNext} className="btn btn-navy btn-sm mt-4">Next step <ArrowRight size={14} aria-hidden="true" /></button>}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function EstimatorPage() {
  const [s, setS] = useState(() => ({
    adults: 2, children: 0, infants: 0, occ: 2, mk: 10, md: 5,
    choice: Object.fromEntries(EST.choices.filter((c) => c.def).map((c) => [c.id, c.def])), toggle: {}, qty: {},
  }));
  const [active, setActive] = useState(0);
  const up = (k) => (v) => setS((p) => ({ ...p, [k]: v }));
  const r = useMemo(() => compute(s), [s]);
  const groups = [...new Set(r.lines.map((l) => l.group))];
  const pickLabel = (c) => { const o = c.options.find((x) => x[0] === s.choice[c.id]); return o ? o[1] : "None"; };
  const addOnCount = Object.values(s.toggle).filter(Boolean).length + Object.values(s.qty).filter((v) => v > 0).length;

  const steps = [
    { title: "Who is travelling", summary: `${s.adults} adult${s.adults > 1 ? "s" : ""}${s.children ? ` · ${s.children} child${s.children > 1 ? "ren" : ""}` : ""}${s.infants ? ` · ${s.infants} infant${s.infants > 1 ? "s" : ""}` : ""} · ${s.occ} per room`, body: (
      <>
        <Stepper label="Adults" value={s.adults} set={(v) => setS((p) => ({ ...p, adults: v }))} min={1} />
        <Stepper label="Children (2–11)" value={s.children} set={up("children")} hint={`${EST.childDiscountPct}% off per-person items`} />
        <Stepper label="Infants (under 2)" value={s.infants} set={up("infants")} hint={`${EST.infantPct}% of the per-person price`} />
        <Stepper label="People per room" value={s.occ} set={up("occ")} min={1} max={5} />
      </>) },
    { title: "How long", summary: `${s.mk} nights Makkah · ${s.md} nights Madinah`, body: (
      <>
        <Stepper label="Nights in Makkah" value={s.mk} set={up("mk")} max={40} />
        <Stepper label="Nights in Madinah" value={s.md} set={up("md")} max={40} />
      </>) },
    ...EST.choices.map((c) => ({ title: c.label, summary: pickLabel(c), body: (
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={c.label}>
        {c.optional && <button type="button" role="radio" aria-checked={!s.choice[c.id]} onClick={() => setS((p) => ({ ...p, choice: { ...p.choice, [c.id]: null } }))} className="choice"><b className="block text-navy">None</b><span className="muted">Skip this</span></button>}
        {c.options.map(([id, label, sub, price]) => (
          <button type="button" key={id} role="radio" aria-checked={s.choice[c.id] === id} onClick={() => setS((p) => ({ ...p, choice: { ...p.choice, [c.id]: id } }))} className="choice">
            <b className="block text-navy">{label}</b><span className="muted block">{sub}</span><span className="mt-1 block text-mid">{taka(price)}{c.unit === "person" ? " per person" : c.unit === "room-night" ? " per room per night" : " per person per night"}</span></button>))}
      </div>) })),
    { title: "Add-ons", summary: addOnCount ? `${addOnCount} selected` : "None selected", body: (
      <>
        {EST.toggles.map((t) => <label key={t.id} className="flex items-center justify-between gap-3 py-2 text-sm"><span className="flex items-center gap-2"><input type="checkbox" checked={!!s.toggle[t.id]} onChange={(e) => setS((p) => ({ ...p, toggle: { ...p.toggle, [t.id]: e.target.checked } }))} />{t.label}</span><span className="muted">{taka(t.price)} per person</span></label>)}
        {EST.quantities.map((q) => <Stepper key={q.id} label={q.label} value={s.qty[q.id] || 0} set={(v) => setS((p) => ({ ...p, qty: { ...p.qty, [q.id]: v } }))} hint={`${taka(q.price)} each`} />)}
      </>) },
  ];

  return (
    <>
      <PageTitle eyebrow="Umrah cost estimator" title="Estimate your Umrah">Umrah can be taken any time, for any length, so the price depends on your choices. Change anything and the estimate updates. Hajj is sold at fixed seasonal prices, so use the Hajj finder for that.</PageTitle>
      <div className="wrap page-body">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:items-start">
          <ol className="flex flex-col gap-3">
            {steps.map((st, i) => (
              <Step key={st.title} n={i + 1} title={st.title} summary={st.summary} open={active === i} last={i === steps.length - 1}
                onOpen={() => setActive(active === i ? -1 : i)} onNext={() => setActive(i + 1)}>{st.body}</Step>
            ))}
          </ol>

          <aside className="overflow-hidden rounded-3xl border border-mid/25 bg-white shadow-lg lg:sticky lg:top-24" aria-label="Your estimate">
            <div className="relative h-36 overflow-hidden md:h-40">
              <img src="/media/hero-5-900.webp" alt="" loading="lazy" decoding="async" style={{ objectPosition: "50% 55%" }} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/25 to-transparent" aria-hidden="true" />
              <h2 className="absolute bottom-3 left-5 text-2xl font-bold text-white drop-shadow">Your estimate</h2>
            </div>
            <div className="p-5">
              <div className="max-h-[38vh] space-y-4 overflow-y-auto pr-1 text-sm">
                {groups.map((g) => (<div key={g}><p className="label !text-mid">{g}</p>
                  {r.lines.filter((l) => l.group === g).map((l) => <div key={l.label} className="mt-1.5 flex justify-between gap-3"><div><p className="text-navy">{l.label}</p><p className="faint">{l.detail}</p></div><span className="shrink-0 tabular-nums">{taka(l.amount)}</span></div>)}</div>))}
              </div>
              <dl className="mt-4 space-y-1 border-t border-mid/20 pt-3 text-sm text-navy-deep/75">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{taka(r.sub)}</dd></div>
                <div className="flex justify-between"><dt>Service charge ({EST.serviceChargePct}%)</dt><dd>{taka(r.service)}</dd></div>
                <div className="flex justify-between"><dt>Price-change buffer ({EST.contingencyPct}%)</dt><dd>{taka(r.cont)}</dd></div>
              </dl>
              <div className="mt-3 rounded-2xl bg-sky p-4"><p className="faint">Estimated total for the group · {r.rooms} room{r.rooms > 1 ? "s" : ""}</p><p className="price !text-3xl">{taka(r.total)}</p><p className="faint">About {taka(r.perPerson)} per person</p></div>
              <LinkButton block className="mt-4" target="_blank" rel="noopener noreferrer" href={`${WHATSAPP}?text=${encodeURIComponent(`I estimated Umrah for ${s.adults} adult(s), ${s.children} child(ren), ${s.infants} infant(s): ${taka(r.total)}. Please send a confirmed quotation.`)}`}>Request confirmed quotation</LinkButton>
              <p className="faint mt-3">This is an estimate, not an offer. Flights, hotels and exchange rates change.</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
