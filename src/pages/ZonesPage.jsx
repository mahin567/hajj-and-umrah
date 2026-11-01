import { useState } from "react";
import { ZONES, WALK_SPEEDS, zoneRange, walkLabel } from "@/data";
import { PageTitle } from "@/Layout";
import { Chip } from "@/components/ui/kit";

export default function ZonesPage() {
  const [speed, setSpeed] = useState("normal");
  const mpm = WALK_SPEEDS[speed].mpm;
  return (
    <>
      <PageTitle eyebrow="Our distance standard" title="Distance & zones">Every hotel is placed in a zone from its measured distance, so “300 m” always means the same thing. Walking times are estimates, not guarantees.</PageTitle>
      <section className="wrap-md page-body">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Walking pace">
          {Object.entries(WALK_SPEEDS).map(([k, v]) => <Chip key={k} radio on={speed === k} onClick={() => setSpeed(k)}>{v.label} · {v.mpm} m/min</Chip>)}
        </div>
        <div className="mt-6 space-y-4">
          {ZONES.map((z) => (
            <div key={z.code} className="panel flex items-center gap-4">
              <span style={{ background: z.color }} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl text-white">{z.code}</span>
              <div className="min-w-0 flex-1"><p className="font-display text-lg font-semibold text-navy">Zone {z.code} · {zoneRange(z)}</p><p className="muted text-sm">{z.meaning}</p></div>
              <div className="text-right"><p className="font-display text-xl font-semibold text-navy">{walkLabel(z, mpm)}</p><p className="faint">on foot</p></div>
            </div>))}
        </div>
        <p className="muted mt-6 text-sm">Distances are measured to the nearest Haram gate. We label whether a figure is a walking route or a straight line. Crowds at prayer times add to walking time.</p>
      </section>
    </>
  );
}
