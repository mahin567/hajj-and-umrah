import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const fmtDate = (v, withTime = true) => (v ? new Date(v).toLocaleString("en-GB", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }) : "—");

// Local phone numbers (01XXXXXXXXX) become international for WhatsApp links.
export const waLink = (phone) => {
  const d = String(phone || "").replace(/\D/g, "");
  return `https://wa.me/${d.startsWith("880") ? d : d.startsWith("0") ? `88${d}` : d}`;
};

const TONES = {
  new: "bg-accent/20 text-navy-deep", pending: "bg-gold/25 text-navy-deep", contacted: "bg-sky text-navy", quoted: "bg-gold/25 text-navy-deep",
  confirmed: "bg-emerald-100 text-emerald-800", completed: "bg-emerald-100 text-emerald-800", open: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-700", cancelled: "bg-red-50 text-red-700", no_show: "bg-red-50 text-red-700", sold_out: "bg-red-50 text-red-700",
  draft: "bg-slate-200 text-slate-700", approved: "bg-emerald-100 text-emerald-800", waiting: "bg-gold/25 text-navy-deep", umrah: "bg-sky text-navy", hajj: "bg-navy text-white",
};
export const Pill = ({ tone, children }) => <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", TONES[tone] || "bg-sky text-navy")}>{children}</span>;

export const StatusSelect = ({ value, options, onChange, label }) => (
  <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="select-sm min-w-[8.5rem] cursor-pointer font-medium">
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

export const Card = ({ className, children }) => <div className={cn("rounded-3xl border border-mid/25 bg-white p-5 shadow-sm md:p-6", className)}>{children}</div>;
export const Empty = ({ children }) => <div className="rounded-3xl border border-dashed border-mid/50 bg-white/80 p-10 text-center text-navy-deep/70">{children}</div>;
export const ErrorBox = ({ children, onRetry }) => <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{children}{onRetry && <button type="button" onClick={onRetry} className="btn btn-outline btn-sm !py-1.5">Try again</button>}</div>;
export const Spinner = () => <div role="status" aria-label="Loading" className="grid gap-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-3xl bg-white/70" />)}</div>;

export function Chips({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map(([v, label, n]) => (
        <button type="button" key={v} aria-pressed={value === v} onClick={() => onChange(v)}
          className={cn("chip !py-1 text-xs md:text-sm", value === v && "!border-navy !bg-navy !text-white")}>
          {label}{n != null && <span className={cn("ml-1.5 opacity-70", value === v && "opacity-90")}>{n}</span>}
        </button>
      ))}
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-deep/60 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-2xl sm:rounded-3xl md:p-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="round-btn"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
