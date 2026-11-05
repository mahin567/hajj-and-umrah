import { useMemo, useState } from "react";
import { MessageCircle, Phone, Search, Trash2, Users } from "lucide-react";
import { adminFetch, useList } from "@/lib/adminApi";
import { Card, Chips, Empty, ErrorBox, Pill, Spinner, StatusSelect, fmtDate, waLink } from "./ui";

const ENQUIRY = [["new", "New"], ["contacted", "Contacted"], ["quoted", "Quoted"], ["closed", "Closed"]];
const APPOINTMENT = [["new", "New"], ["pending", "Pending confirmation"], ["confirmed", "Confirmed"], ["completed", "Completed"], ["cancelled", "Cancelled"], ["no_show", "No-show"]];

/** Enquiries and appointments share one screen: search, filter by status, change status, reply on WhatsApp. */
export default function Inbox({ kind }) {
  const isAppt = kind === "appointments";
  const statuses = isAppt ? APPOINTMENT : ENQUIRY;
  const { items, setItems, error, reload } = useList(kind);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [problem, setProblem] = useState("");

  const counts = useMemo(() => Object.fromEntries(statuses.map(([v]) => [v, (items || []).filter((i) => i.status === v).length])), [items, statuses]);
  const shown = useMemo(() => (items || []).filter((i) => (status === "all" || i.status === status) &&
    `${i.name} ${i.phone} ${i.email || ""} ${i.message || ""}`.toLowerCase().includes(q.trim().toLowerCase())), [items, q, status]);

  async function setRowStatus(row, next) {
    const before = row.status;
    setProblem("");
    setItems((l) => l.map((i) => (i.id === row.id ? { ...i, status: next } : i)));
    const r = await adminFetch(`/${kind}/${row.id}/`, { method: "PATCH", body: { status: next } });
    if (!r.ok) { setItems((l) => l.map((i) => (i.id === row.id ? { ...i, status: before } : i))); setProblem("Could not save that change. Please try again."); }
  }
  async function remove(row) {
    if (!window.confirm(`Delete ${isAppt ? "appointment" : "enquiry"} from ${row.name}? This cannot be undone.`)) return;
    const r = await adminFetch(`/${kind}/${row.id}/`, { method: "DELETE" });
    if (r.ok) setItems((l) => l.filter((i) => i.id !== row.id)); else setProblem("Could not delete. Please try again.");
  }

  if (error) return <ErrorBox onRetry={reload}>{error}</ErrorBox>;
  if (!items) return <Spinner />;
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="relative">
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mid" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone or message" aria-label="Search" className="field !pl-10" />
        </div>
        <Chips value={status} onChange={setStatus} options={[["all", "All", items.length], ...statuses.map(([v, l]) => [v, l.split(" ")[0], counts[v]])]} />
      </Card>
      {problem && <ErrorBox>{problem}</ErrorBox>}
      {shown.length === 0 ? <Empty>{items.length ? "Nothing matches your search." : `No ${kind} yet. New ones from the website appear here.`}</Empty> : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {shown.map((r) => (
            <li key={r.id}>
              <Card className="h-full !p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-lg font-semibold text-navy-deep">{r.name}</p>
                    <p className="faint mt-0.5">{isAppt ? `Wants ${fmtDate(r.preferred_at)}` : `Received ${fmtDate(r.created_at)}`}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2"><Pill tone={r.kind}>{r.kind}</Pill><Pill tone={r.status}>{r.status.replace("_", " ")}</Pill></div>
                </div>
                <dl className="mt-3 space-y-1 text-sm text-navy-deep/80">
                  <div className="flex gap-2"><dt className="sr-only">Phone</dt><dd className="flex items-center gap-2"><Phone size={14} className="text-mid" aria-hidden="true" /><a className="link" href={`tel:${r.phone}`}>{r.phone}</a></dd></div>
                  {r.email && <div className="break-all">{r.email}</div>}
                  {isAppt && <div className="flex items-center gap-2"><Users size={14} className="text-mid" aria-hidden="true" />{r.travellers} traveller{r.travellers > 1 ? "s" : ""}{r.consultation_type && ` · ${r.consultation_type}`}</div>}
                  {r.package_title && <div>Package: <b className="text-navy">{r.package_title}</b></div>}
                </dl>
                {r.message && <p className="mt-3 whitespace-pre-wrap break-words rounded-2xl bg-sky p-3 text-sm text-navy-deep">{r.message}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-mid/20 pt-4">
                  <StatusSelect label={`Status for ${r.name}`} value={r.status} options={statuses} onChange={(v) => setRowStatus(r, v)} />
                  <a href={waLink(r.phone)} target="_blank" rel="noopener noreferrer" className="btn btn-navy btn-sm !py-1.5"><MessageCircle size={15} aria-hidden="true" />WhatsApp</a>
                  <button type="button" onClick={() => remove(r)} aria-label={`Delete ${r.name}`} className="round-btn ml-auto text-red-700 hover:!bg-red-50"><Trash2 size={16} /></button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
