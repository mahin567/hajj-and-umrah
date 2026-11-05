import { useMemo, useState } from "react";
import { Check, EyeOff, Star, Trash2 } from "lucide-react";
import { adminFetch, useList } from "@/lib/adminApi";
import { Card, Chips, Empty, ErrorBox, Pill, Spinner, fmtDate } from "./ui";

/** Reviews appear on the website only after you approve them here. */
export default function Reviews() {
  const { items, setItems, error, reload } = useList("reviews");
  const [view, setView] = useState("waiting");
  const [problem, setProblem] = useState("");
  const waiting = (items || []).filter((r) => !r.approved).length;
  const shown = useMemo(() => (items || []).filter((r) => (view === "all" ? true : view === "waiting" ? !r.approved : r.approved)), [items, view]);

  async function toggle(r) {
    setProblem("");
    const res = await adminFetch(`/reviews/${r.id}/`, { method: "PATCH", body: { approved: !r.approved } });
    if (res.ok) setItems((l) => l.map((x) => (x.id === r.id ? { ...x, approved: !r.approved } : x))); else setProblem("Could not save. Please try again.");
  }
  async function remove(r) {
    if (!window.confirm(`Delete the review from ${r.name}? This cannot be undone.`)) return;
    const res = await adminFetch(`/reviews/${r.id}/`, { method: "DELETE" });
    if (res.ok) setItems((l) => l.filter((x) => x.id !== r.id)); else setProblem("Could not delete. Please try again.");
  }

  if (error) return <ErrorBox onRetry={reload}>{error}</ErrorBox>;
  if (!items) return <Spinner />;
  return (
    <div className="space-y-5">
      <Card><Chips value={view} onChange={setView} options={[["waiting", "Waiting for approval", waiting], ["approved", "Live on website", items.length - waiting], ["all", "All", items.length]]} /></Card>
      {problem && <ErrorBox>{problem}</ErrorBox>}
      {shown.length === 0 ? <Empty>{view === "waiting" ? "No reviews are waiting. You're all caught up." : "No reviews here yet."}</Empty> : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {shown.map((r) => (
            <li key={r.id}>
              <Card className="flex h-full flex-col !p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-lg font-semibold text-navy-deep">{r.name}</p>
                  <Pill tone={r.approved ? "approved" : "waiting"}>{r.approved ? "Live" : "Waiting"}</Pill>
                </div>
                <p className="mt-1 flex items-center gap-0.5 text-gold" aria-label={`${r.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} aria-hidden="true" className={n <= r.rating ? "fill-current" : "text-mid/40"} />)}
                  <span className="faint ml-2">{fmtDate(r.created_at, false)}</span>
                </p>
                <p className="mt-3 flex-1 whitespace-pre-wrap break-words text-sm text-navy-deep/85">{r.text}</p>
                <div className="mt-4 flex items-center gap-2 border-t border-mid/20 pt-4">
                  <button type="button" onClick={() => toggle(r)} className={`btn btn-sm !py-1.5 ${r.approved ? "btn-outline" : "btn-navy"}`}>
                    {r.approved ? <><EyeOff size={15} aria-hidden="true" />Hide from website</> : <><Check size={15} aria-hidden="true" />Approve</>}
                  </button>
                  <button type="button" onClick={() => remove(r)} aria-label={`Delete review from ${r.name}`} className="round-btn ml-auto text-red-700 hover:!bg-red-50"><Trash2 size={16} /></button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
