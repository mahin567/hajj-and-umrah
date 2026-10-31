import { useState } from "react";
import { ZONES, WALK_SPEEDS, zoneRange, walkLabel } from "@/data";
import { PageTitle } from "@/Layout";
import { cn } from "@/lib/utils";

export default function ZonesPage() {
  const [speed, setSpeed] = useState("normal");
  const mpm = WALK_SPEEDS[speed].mpm;
  return (
    <>
      <PageTitle eyebrow="Our distance standard" title="Distance & zones">Every hotel is placed in a zone from its measured distance, so “300 m” always means the same thing. Walking times are estimates, not guarantees.</PageTitle>
      <section className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Walking pace">
          {Object.entries(WALK_SPEEDS).map(([k, v]) => <button key={k} role="radio" aria-checked={speed === k} onClick={() => setSpeed(k)} className={cn("rounded-full border px-4 py-1.5 text-sm", speed === k ? "border-navy bg-navy text-white" : "border-mid/40 bg-white text-navy")}>{v.label} · {v.mpm} m/min</button>)}
        </div>
        <div className="mt-6 space-y-4">
          {ZONES.map((z) => (
            <div key={z.code} className="flex items-center gap-4 rounded-2xl border border-mid/30 bg-white p-5">
              <span style={{ background: z.color }} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl text-white">{z.code}</span>
              <div className="min-w-0 flex-1"><p className="font-display text-lg text-navy">Zone {z.code} · {zoneRange(z)}</p><p className="text-sm text-navy-deep/70">{z.meaning}</p></div>
              <div className="text-right"><p className="font-display text-xl text-navy">{walkLabel(z, mpm)}</p><p className="text-xs text-navy-deep/60">on foot</p></div>
            </div>))}
        </div>
        <p className="mt-6 text-sm text-navy-deep/65">Distances are measured to the nearest Haram gate. We label whether a figure is a walking route or a straight line. Crowds at prayer times add to walking time.</p>
      </section>
    </>
  );
}
