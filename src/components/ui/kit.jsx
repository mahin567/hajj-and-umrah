import { cn } from "@/lib/utils";

// Small building blocks shared by every page. Visual rules live in index.css; these only add structure.

export const Chip = ({ on, radio, className, ...p }) => (
  <button type="button" {...(radio ? { role: "radio", "aria-checked": !!on } : { "aria-pressed": !!on })} className={cn("chip", className)} {...p} />
);

export const FilterGroup = ({ label, children }) => (
  <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
    <span className="label mr-1">{label}</span>{children}
  </div>
);

export const FilterBar = ({ children }) => (
  <div className="panel flex flex-col gap-4 !p-4 md:flex-row md:flex-wrap md:items-center md:gap-8">{children}</div>
);

export const SortSelect = ({ value, onChange, options }) => (
  <label className="muted flex items-center gap-2 text-sm md:ml-auto">Sort
    <select value={value} onChange={(e) => onChange(e.target.value)} className="select-sm">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  </label>
);

export const ResultCount = ({ children }) => <p role="status" className="muted my-4 text-sm">{children}</p>;

export const Section = ({ id, tone = "plain", narrow, className, children }) => (
  <section id={id} className={cn("section defer", tone === "sky" && "bg-sky", className)}>
    <div className={narrow ? "wrap-sm" : "wrap"}>{children}</div>
  </section>
);

export const SectionTitle = ({ eyebrow, children, className }) => (
  <div className={cn("mb-8 md:mb-12", className)}>
    {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
    <h2 className="text-3xl md:text-5xl">{children}</h2>
  </div>
);

export const Skeleton = ({ className }) => <div aria-hidden="true" className={cn("h-80 animate-pulse rounded-2xl border border-mid/20 bg-white/70", className)} />;

// Literal class names (not built from a template string) so Tailwind can see and keep them.
const VARIANT = { accent: "btn-accent", navy: "btn-navy", outline: "btn-outline", "ghost-light": "btn-ghost-light" };
export const LinkButton = ({ variant = "accent", small, block, className, ...p }) => (
  <a {...p} className={cn("btn", VARIANT[variant], small && "btn-sm", block && "btn-block", className)} />
);
