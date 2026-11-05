import { useMemo, useState } from "react";
import { CalendarDays, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { taka } from "@/lib/utils";
import { adminFetch, useList } from "@/lib/adminApi";
import { Card, Chips, Empty, ErrorBox, Modal, Pill, Spinner, StatusSelect, fmtDate } from "./ui";

const STATUS = [["draft", "Draft (hidden)"], ["open", "Open"], ["sold_out", "Sold out"], ["completed", "Completed"]];
const METHOD = [["walking", "Walking route"], ["straight", "Straight line"], ["unverified", "Approximate, not verified"]];
const BLANK = { kind: "hajj", title: "", departure_date: "", duration_days: "", hotel_name: "", distance_m: "", distance_method: "unverified", price_bdt: "", seats_remaining: "", offer_deadline: "", status: "draft", featured: false, last_verified: "" };
const NUMBERS = ["duration_days", "distance_m", "price_bdt", "seats_remaining"];
const toLocalInput = (iso) => { if (!iso) return ""; const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

function Field({ label, hint, error, children }) {
  return <label className="block text-sm"><span className="mb-1 block font-medium text-navy">{label}</span>{children}{hint && <span className="faint mt-1 block">{hint}</span>}{error && <span className="err mt-1 block">{error}</span>}</label>;
}

function PackageForm({ pkg, onSaved, onClose }) {
  const [f, setF] = useState(pkg ? { ...BLANK, ...Object.fromEntries(Object.entries(pkg).map(([k, v]) => [k, v ?? ""])), offer_deadline: toLocalInput(pkg.offer_deadline) } : BLANK);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErrors({});
    const body = { ...f };
    NUMBERS.forEach((k) => { body[k] = f[k] === "" ? null : Number(f[k]); });
    ["departure_date", "last_verified"].forEach((k) => { body[k] = f[k] || null; });
    body.offer_deadline = f.offer_deadline ? new Date(f.offer_deadline).toISOString() : null;
    delete body.id;
    const r = await adminFetch(pkg ? `/packages/${pkg.id}/` : "/packages/", { method: pkg ? "PATCH" : "POST", body });
    setBusy(false);
    if (r.ok) onSaved(r.data);
    else setErrors(r.data && typeof r.data === "object" ? Object.fromEntries(Object.entries(r.data).map(([k, v]) => [k, [].concat(v).join(" ")])) : { _: "Could not save. Please try again." });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {(errors._ || errors.detail) && <ErrorBox>{errors._ || errors.detail}</ErrorBox>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Type" error={errors.kind}><select className="field" value={f.kind} onChange={set("kind")}><option value="hajj">Hajj</option><option value="umrah">Umrah</option></select></Field>
        <div className="sm:col-span-2"><Field label="Package name" error={errors.title}><input required autoFocus className="field" value={f.title} onChange={set("title")} placeholder="e.g. Luxury Hajj 2027" /></Field></div>
        <Field label="Departure date" error={errors.departure_date}><input type="date" className="field" value={f.departure_date} onChange={set("departure_date")} /></Field>
        <Field label="Duration (days)" error={errors.duration_days}><input type="number" min="0" className="field" value={f.duration_days} onChange={set("duration_days")} /></Field>
        <Field label="Price (৳)" error={errors.price_bdt}><input type="number" min="0" className="field" value={f.price_bdt} onChange={set("price_bdt")} /></Field>
        <div className="sm:col-span-3"><Field label="Hotel name" error={errors.hotel_name}><input className="field" value={f.hotel_name} onChange={set("hotel_name")} /></Field></div>
        <Field label="Distance to Haram (m)" error={errors.distance_m}><input type="number" min="0" className="field" value={f.distance_m} onChange={set("distance_m")} /></Field>
        <div className="sm:col-span-2"><Field label="How the distance was measured" error={errors.distance_method}><select className="field" value={f.distance_method} onChange={set("distance_method")}>{METHOD.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field></div>
        <Field label="Seats remaining" hint="Only if you track it exactly" error={errors.seats_remaining}><input type="number" min="0" className="field" value={f.seats_remaining} onChange={set("seats_remaining")} /></Field>
        <Field label="Offer ends" error={errors.offer_deadline}><input type="datetime-local" className="field" value={f.offer_deadline} onChange={set("offer_deadline")} /></Field>
        <Field label="Details last checked" error={errors.last_verified}><input type="date" className="field" value={f.last_verified} onChange={set("last_verified")} /></Field>
        <Field label="Status" hint="Draft packages are hidden from the website" error={errors.status}><select className="field" value={f.status} onChange={set("status")}>{STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-medium text-navy"><input type="checkbox" checked={f.featured} onChange={set("featured")} />Feature on homepage</label>
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-mid/20 pt-4">
        <button type="button" onClick={onClose} className="btn btn-outline btn-sm">Cancel</button>
        <button type="submit" disabled={busy} className="btn btn-navy btn-sm">{busy ? "Saving…" : pkg ? "Save changes" : "Add package"}</button>
      </div>
    </form>
  );
}

export default function Packages() {
  const { items, setItems, error, reload } = useList("packages");
  const [view, setView] = useState("all");
  const [editing, setEditing] = useState(null); // null | "new" | package
  const [problem, setProblem] = useState("");
  const shown = useMemo(() => (items || []).filter((p) => view === "all" || p.kind === view), [items, view]);

  async function setStatus(p, status) {
    const before = p.status; setProblem("");
    setItems((l) => l.map((x) => (x.id === p.id ? { ...x, status } : x)));
    const r = await adminFetch(`/packages/${p.id}/`, { method: "PATCH", body: { status } });
    if (!r.ok) { setItems((l) => l.map((x) => (x.id === p.id ? { ...x, status: before } : x))); setProblem("Could not save that change."); }
  }
  async function remove(p) {
    if (!window.confirm(`Delete "${p.title}"? Enquiries about it stay, but lose the link to this package.`)) return;
    const r = await adminFetch(`/packages/${p.id}/`, { method: "DELETE" });
    if (r.ok) setItems((l) => l.filter((x) => x.id !== p.id)); else setProblem("Could not delete. Please try again.");
  }
  const saved = (row) => { setItems((l) => (l.some((x) => x.id === row.id) ? l.map((x) => (x.id === row.id ? row : x)) : [...l, row])); setEditing(null); };

  if (error) return <ErrorBox onRetry={reload}>{error}</ErrorBox>;
  if (!items) return <Spinner />;
  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <Chips value={view} onChange={setView} options={[["all", "All", items.length], ["hajj", "Hajj", items.filter((p) => p.kind === "hajj").length], ["umrah", "Umrah", items.filter((p) => p.kind === "umrah").length]]} />
        <button type="button" onClick={() => setEditing("new")} className="btn btn-navy btn-sm"><Plus size={16} aria-hidden="true" />Add package</button>
      </Card>
      {problem && <ErrorBox>{problem}</ErrorBox>}
      {shown.length === 0 ? <Empty>No packages yet. Click “Add package” to create the first one.</Empty> : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {shown.map((p) => (
            <li key={p.id}>
              <Card className="h-full !p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 break-words text-lg font-semibold text-navy-deep">{p.featured && <Star size={16} className="shrink-0 fill-current text-gold" aria-label="Featured" />}{p.title}</p>
                    {p.hotel_name && <p className="faint mt-0.5">{p.hotel_name}{p.distance_m != null && ` · ${p.distance_m} m`}</p>}
                  </div>
                  <Pill tone={p.kind}>{p.kind}</Pill>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div><dt className="label">Price</dt><dd className="font-semibold text-navy">{p.price_bdt ? taka(p.price_bdt) : "—"}</dd></div>
                  <div><dt className="label">Departs</dt><dd className="flex items-center gap-1"><CalendarDays size={13} className="text-mid" aria-hidden="true" />{fmtDate(p.departure_date, false)}</dd></div>
                  <div><dt className="label">Seats</dt><dd>{p.seats_remaining ?? "—"}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-mid/20 pt-4">
                  <StatusSelect label={`Status for ${p.title}`} value={p.status} options={STATUS} onChange={(v) => setStatus(p, v)} />
                  <button type="button" onClick={() => setEditing(p)} className="btn btn-outline btn-sm !py-1.5"><Pencil size={14} aria-hidden="true" />Edit</button>
                  <button type="button" onClick={() => remove(p)} aria-label={`Delete ${p.title}`} className="round-btn ml-auto text-red-700 hover:!bg-red-50"><Trash2 size={16} /></button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {editing && <Modal title={editing === "new" ? "Add package" : "Edit package"} onClose={() => setEditing(null)}><PackageForm pkg={editing === "new" ? null : editing} onSaved={saved} onClose={() => setEditing(null)} /></Modal>}
    </div>
  );
}
