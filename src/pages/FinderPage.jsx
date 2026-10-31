import { useMemo, useState } from "react";
import { Check, Minus, X, ArrowLeft, ArrowRight, Star, RotateCcw } from "lucide-react";
import { BUDGET_BANDS, ZONES, zoneRange, UPGRADES } from "@/data";
import { options, rank, SETTINGS } from "@/lib/finder";
import { taka, cn } from "@/lib/utils";
import { PageTitle, WHATSAPP } from "@/Layout";
import { PackageCard } from "@/components/PackageCard";

const opt = options();
const zoneOpts = (codes) => codes.map((c) => { const z = ZONES.find((x) => x.code === c); return [c, `Zone ${c} · ${zoneRange(z)}`, z.meaning]; });
const STEPS = [
  { q: "type", title: "Which type of Hajj do you prefer?", hint: "Shifting changes your accommodation during the programme. Non-shifting keeps you in one place.", opts: [["shifting", "Shifting"], ["non_shifting", "Non-shifting"]].filter(([v]) => opt.type.includes(v)) },
  { q: "period", title: "When do you want to travel?", hint: "Awal Fatra is the long programme that leaves early. Akhir Fatra is the shorter, later one.", opts: [["awal", "Awal Fatra (first period)"], ["akhir", "Akhir Fatra (last period)"]].filter(([v]) => opt.period.includes(v)) },
  { q: "makkah", title: "How close to the Haram in Makkah?", hint: "Closer than you ask for always counts as a match.", opts: zoneOpts(opt.makkah) },
  { q: "madinah", title: "How close to Masjid an-Nabawi in Madinah?", hint: "", opts: zoneOpts(opt.madinah) },
  { q: "room", title: "How many people per room?", hint: "Fewer per room costs more. This picks a different row of the price list.", opts: opt.room.map((n) => [String(n), `${n} per room`]) },
  { q: "tent", title: "Which Mina tent?", hint: "The standard (D category) tent is included. VIP is a priced upgrade.", opts: [["standard", "Standard tent (included)"], ["vip", `VIP tent (+${taka(UPGRADES.vipTent.price)})`]] },
  { q: "budget", title: "What is your budget per person?", hint: "We compare against the final price, including any upgrade you chose.", opts: BUDGET_BANDS.map((b) => [b.id, b.label]) },
];

const Icon = ({ kind }) => kind === "ok" ? <Check size={16} className="text-green-700" /> : kind === "close" ? <Minus size={16} className="text-amber-600" /> : <X size={16} className="text-red-600" />;

function Result({ sel, must, reset, back }) {
  const ranked = useMemo(() => rank(sel, must), [sel, must]);
  if (!ranked.length) return (
    <div className="rounded-2xl border border-dashed border-mid/60 bg-white p-8 text-center">
      <h2 className="font-display text-2xl text-navy">No package meets your must-haves</h2>
      <p className="mt-2 text-navy-deep/70">We do not currently offer that combination. Talk to an advisor and we will tell you what is possible.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3"><button onClick={back} className="rounded-full border border-navy px-5 py-2 text-sm text-navy">Change answers</button><a href={WHATSAPP} className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-navy-deep">Talk to an advisor</a></div>
    </div>
  );
  const [best, ...rest] = ranked;
  const alts = rest.slice(0, SETTINGS.alternatives);
  const low = best.percent < SETTINGS.lowMatch;
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-mid/30 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.3em] text-mid">{low ? "Closest we have" : "Your closest match"}</p>
            <h2 className="mt-1 font-display text-2xl text-navy md:text-3xl">{best.pkg.title}</h2></div>
          <div className="text-center"><div className="font-display text-4xl text-navy">{best.percent}%</div><div className="text-xs text-navy-deep/60">match</div></div>
        </div>
        {low && <p className="mt-4 rounded-xl bg-sky p-4 text-sm text-navy-deep">This is not a strong match for what you asked. We would rather say so than oversell it. An advisor can often find options that are not on the website.</p>}
        {best.lines.length > 0 && <ul className="mt-5 divide-y divide-mid/15">{best.lines.map((l) => (
          <li key={l.q} className="flex items-center gap-3 py-2.5 text-sm"><Icon kind={l.kind} /><span className="w-40 shrink-0 text-navy-deep/60">{l.label}</span><span className="text-navy-deep">{l.wanted}{l.note ? <span className="text-navy-deep/60"> · {l.note}</span> : null}</span>{must.includes(l.q) && <Star size={14} className="ml-auto shrink-0 text-mid" fill="currentColor" aria-label="Must-have" />}</li>))}</ul>}
        <div className="mt-5 rounded-xl bg-sky p-4 text-sm">
          <div className="flex justify-between"><span>Package price ({best.roomOcc} per room)</span><span>{taka(best.basePrice)}</span></div>
          {best.upgrades.map((u) => <div key={u.name} className="flex justify-between text-navy-deep/75"><span>{u.name}</span><span>+{taka(u.price)}</span></div>)}
          <div className="mt-2 flex justify-between border-t border-mid/20 pt-2 font-display text-lg text-navy"><span>Your price</span><span>{taka(best.price)}</span></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={`#/packages/${best.pkg.slug}`} className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-navy-deep hover:bg-accent-light">View programme</a>
          <a href={`${WHATSAPP}?text=${encodeURIComponent(`I used the finder and ${best.pkg.title} matched ${best.percent}%. Please send a confirmed quotation.`)}`} className="rounded-full border border-navy px-6 py-3 text-sm text-navy hover:bg-sky">Request quotation</a>
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-navy-deep/70 hover:text-navy"><RotateCcw size={14} />Start again</button>
        </div>
        <p className="mt-4 text-xs text-navy-deep/60">Estimated price. A written quotation follows once availability is confirmed.</p>
      </div>
      {alts.length > 0 && <div><h3 className="mb-3 font-display text-xl text-navy">Other close options</h3>
        <div className="grid gap-5 md:grid-cols-2">{alts.map((a) => <div key={a.pkg.slug}><p className="mb-2 text-sm text-navy-deep/70">{a.percent}% match</p><PackageCard p={a.pkg} occ={a.roomOcc} /></div>)}</div></div>}
    </div>
  );
}

export default function FinderPage() {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState({}); // q -> option id
  const [must, setMust] = useState([]);
  const sel = useMemo(() => ({ ...ans, budget: ans.budget ? BUDGET_BANDS.find((b) => b.id === ans.budget) : undefined }), [ans]);
  const done = i >= STEPS.length;
  const s = STEPS[i];
  const live = useMemo(() => rank(sel, must).filter((r) => r.percent >= SETTINGS.lowMatch).length, [sel, must]);
  const pick = (v) => setAns((a) => ({ ...a, [s.q]: a[s.q] === v ? undefined : v }));
  const toggleMust = () => setMust((m) => (m.includes(s.q) ? m.filter((x) => x !== s.q) : m.length < SETTINGS.maxMustHaves ? [...m, s.q] : m));
  const reset = () => { setAns({}); setMust([]); setI(0); };
  return (
    <>
      <PageTitle eyebrow="Hajj package finder" title="Find your Hajj">Answer what matters to you. Every question can be skipped. You see your result without giving a phone number.</PageTitle>
      <section className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {done ? <Result sel={sel} must={must} reset={reset} back={() => setI(STEPS.length - 1)} /> : (
          <div className="rounded-2xl border border-mid/30 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between text-xs text-navy-deep/60"><span>Question {i + 1} of {STEPS.length}</span><span role="status">{live} package{live === 1 ? "" : "s"} match so far</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky"><div className="h-full bg-accent transition-all" style={{ width: `${(i / STEPS.length) * 100}%` }} /></div>
            <h2 className="mt-6 font-display text-2xl text-navy">{s.title}</h2>
            {s.hint && <p className="mt-2 text-sm text-navy-deep/70">{s.hint}</p>}
            <div className="mt-5 grid gap-3" role="radiogroup" aria-label={s.title}>
              {s.opts.map(([v, label, sub]) => (
                <button key={v} role="radio" aria-checked={ans[s.q] === v} onClick={() => pick(v)} className={cn("rounded-xl border px-4 py-3 text-left transition", ans[s.q] === v ? "border-navy bg-sky" : "border-mid/30 hover:border-navy")}>
                  <span className="block font-medium text-navy">{label}</span>{sub && <span className="text-sm text-navy-deep/65">{sub}</span>}</button>))}
            </div>
            <label className={cn("mt-4 flex items-center gap-2 text-sm", !ans[s.q] && "opacity-40")}>
              <input type="checkbox" disabled={!ans[s.q] || (!must.includes(s.q) && must.length >= SETTINGS.maxMustHaves)} checked={must.includes(s.q)} onChange={toggleMust} />
              This is essential for me <span className="text-navy-deep/50">(up to {SETTINGS.maxMustHaves})</span></label>
            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="inline-flex items-center gap-1 text-sm text-navy disabled:opacity-30"><ArrowLeft size={16} />Back</button>
              <div className="flex gap-3">
                {ans[s.q] ? null : <button onClick={() => setI(i + 1)} className="rounded-full px-5 py-2.5 text-sm text-navy-deep/70 hover:text-navy">No preference</button>}
                <button onClick={() => setI(i + 1)} className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-navy-deep hover:bg-accent-light">{i === STEPS.length - 1 ? "See my result" : "Next"}<ArrowRight size={16} /></button>
              </div>
            </div>
          </div>)}
      </section>
    </>
  );
}
