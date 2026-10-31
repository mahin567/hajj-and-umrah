import { useState } from "react";
import { Menu, X, MessageCircle, Phone, MapPin } from "lucide-react";
import { WHATSAPP, PHONE, PHONE_DISPLAY, ADDRESS, MAP_LINK } from "@/config";

export { WHATSAPP, PHONE };

export const NAV = [
  ["Packages", "#/packages"], ["Group Umrah", "#/group-umrah"], ["Find your Hajj", "#/find-your-hajj"],
  ["Umrah estimate", "#/estimate"], ["Hotels", "#/hotels"], ["Trust Centre", "#/trust"],
];

const Logo = ({ className, alt = "" }) => <img src="/logo.webp" width="66" height="56" alt={alt} className={className} />;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-deep/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 md:px-8">
        <a href="#/" aria-label="Home"><Logo alt="Own The World – Hajj & Umrah" className="h-11 w-auto rounded-xl bg-white p-1" /></a>
        <nav aria-label="Main" className="hidden gap-6 xl:flex">
          {NAV.map(([l, h]) => <a key={h} href={h} className="text-sm text-white/80 transition-colors hover:text-accent-light">{l}</a>)}
        </nav>
        <a href="#/book" className="hidden rounded-full bg-accent px-5 py-2 text-sm font-medium text-navy-deep transition hover:bg-accent-light sm:block">Book consultation</a>
        <button aria-label="Menu" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)} className="rounded-full bg-white/10 p-2 text-white xl:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="flex flex-col gap-1 border-t border-white/10 px-4 pb-4 pt-2 xl:hidden">
          {NAV.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-white/90 hover:bg-white/10">{l}</a>)}
          <a href="#/book" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-accent px-5 py-2.5 text-center font-medium text-navy-deep">Book consultation</a>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 bg-navy-deep text-white/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-10 text-center text-xs">
        <Logo className="h-14 w-auto rounded-xl bg-white p-1" />
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          {[...NAV, ["Distance & zones", "#/zones"], ["Book appointment", "#/book"]].map(([l, h]) => <a key={h} href={h} className="hover:text-accent-light">{l}</a>)}
        </nav>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10"><MessageCircle size={14} />WhatsApp</a>
          <a href={PHONE} className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10"><Phone size={14} />{PHONE_DISPLAY}</a>
        </div>
        <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-md items-start gap-2 text-white/70 hover:text-white"><MapPin size={14} className="mt-0.5 shrink-0" />{ADDRESS}</a>
        <p>Prices are estimates. A written quotation is provided after availability is confirmed.</p>
        <p>© {new Date().getFullYear()} Own The World – Hajj &amp; Umrah. All rights reserved.</p>
      </div>
    </footer>
  );
}

export const PageTitle = ({ eyebrow, title, children }) => (
  <div className="bg-sky">
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-mid">{eyebrow}</p>
      <h1 tabIndex={-1} id="page-title" className="font-display text-3xl text-navy outline-none md:text-5xl">{title}</h1>
      {children && <p className="mt-3 max-w-2xl text-navy-deep/70">{children}</p>}
    </div>
  </div>
);

export const ZoneBadge = ({ zone, className = "" }) =>
  zone ? <span style={{ background: zone.color }} className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold text-white ${className}`}>Zone {zone.code}</span> : null;

export const Empty = ({ children }) => <div className="rounded-2xl border border-dashed border-mid/60 bg-white p-8 text-center text-navy-deep/70">{children}</div>;
