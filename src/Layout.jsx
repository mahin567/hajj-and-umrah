import { useState } from "react";
import { Menu, X, MessageCircle, Phone, MapPin } from "lucide-react";
import { WHATSAPP, PHONE, PHONE_DISPLAY, ADDRESS, MAP_LINK } from "@/config";
import { cn } from "@/lib/utils";
import { LinkButton, Skeleton } from "@/components/ui/kit";

export { WHATSAPP, PHONE };

// One navigation list for the header, mobile menu, home hero and footer.
export const NAV = [
  ["Packages", "#/packages"], ["Group Umrah", "#/group-umrah"], ["Find your Hajj", "#/find-your-hajj"],
  ["Umrah estimate", "#/estimate"], ["Hotels", "#/hotels"], ["Trust Centre", "#/trust"],
];

const Logo = ({ className, alt = "" }) => <img src="/logo.webp" width="66" height="56" alt={alt} className={cn("w-auto rounded-xl bg-white p-1", className)} />;

/** `overlay` floats the header on top of the home hero. Every other page uses the sticky bar. */
export function Header({ overlay = false }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const pill = overlay ? "bg-navy-deep/80 backdrop-blur" : "bg-white/10";
  return (
    <header className={cn("z-40", overlay ? "absolute inset-x-0 top-0" : "sticky top-0 border-b border-white/10 bg-navy-deep/95 backdrop-blur")}>
      <div className="wrap flex items-center justify-between gap-4 py-2.5">
        <a href="#/" aria-label="Own The World – Hajj & Umrah"><Logo alt="Own The World – Hajj & Umrah" className={cn("h-11", overlay && "h-12 shadow-lg sm:h-14")} /></a>
        <nav aria-label="Main" className={cn("hidden gap-6 xl:flex", overlay && "rounded-full px-8 py-2.5", overlay && pill)}>
          {NAV.map(([l, h]) => <a key={h} href={h} className="text-sm text-white/80 transition-colors hover:text-accent-light">{l}</a>)}
        </nav>
        <LinkButton href="#/book" small className="hidden sm:inline-flex">Book consultation</LinkButton>
        <button aria-label="Menu" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)} className={cn("rounded-full p-2 text-white xl:hidden", pill)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className={cn("flex flex-col gap-1 px-4 pb-4 pt-2 xl:hidden", overlay ? "mx-4 rounded-2xl bg-navy-deep" : "border-t border-white/10")}>
          {NAV.map(([l, h]) => <a key={h} href={h} onClick={close} className="rounded-lg px-3 py-2.5 text-white/90 hover:bg-white/10">{l}</a>)}
          <LinkButton href="#/book" onClick={close} className="mt-2">Book consultation</LinkButton>
        </nav>
      )}
    </header>
  );
}

export function Footer({ className }) {
  return (
    <footer className={cn("mt-16 bg-navy-deep text-white/70", className)}>
      <div className="wrap flex flex-col items-center gap-5 py-10 text-center text-xs">
        <Logo className="h-14" />
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          {[...NAV, ["Distance & zones", "#/zones"], ["Book appointment", "#/book"]].map(([l, h]) => <a key={h} href={h} className="hover:text-accent-light">{l}</a>)}
        </nav>
        <div className="flex flex-wrap justify-center gap-3">
          <LinkButton href={WHATSAPP} target="_blank" rel="noopener noreferrer" variant="ghost-light" small><MessageCircle size={14} />WhatsApp</LinkButton>
          <LinkButton href={PHONE} variant="ghost-light" small><Phone size={14} />{PHONE_DISPLAY}</LinkButton>
        </div>
        <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-md items-start gap-2 hover:text-white"><MapPin size={14} className="mt-0.5 shrink-0" />{ADDRESS}</a>
        <p>Prices are estimates. A written quotation is provided after availability is confirmed.</p>
        <p>© {new Date().getFullYear()} Own The World – Hajj &amp; Umrah. All rights reserved.</p>
      </div>
    </footer>
  );
}

export const PageTitle = ({ eyebrow, title, children }) => (
  <div className="bg-sky">
    <div className="wrap py-10 md:py-14">
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h1 tabIndex={-1} id="page-title" className="text-3xl outline-none md:text-5xl">{title}</h1>
      {children && <p className="muted mt-3 max-w-2xl">{children}</p>}
    </div>
  </div>
);

export const ZoneBadge = ({ zone, className = "" }) =>
  zone ? <span style={{ background: zone.color }} className={cn("inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold text-white", className)}>Zone {zone.code}</span> : null;

export const Empty = ({ children }) => <div className="panel-empty">{children}</div>;
export { Skeleton };
