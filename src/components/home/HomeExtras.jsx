import { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, CircleHelp, Calculator, CalendarCheck, ChevronDown, ChevronLeft, ChevronRight, HeartHandshake, ListChecks, MessageCircle, Moon, Phone, PhoneCall, Quote, ShieldCheck, Star, Type } from "lucide-react";
import { Section, SectionTitle, LinkButton } from "@/components/ui/kit";
import { WHATSAPP, PHONE, PHONE_DISPLAY } from "@/config";
import { ZONES } from "@/data";
import { cn } from "@/lib/utils";

/* Visual-only additions for the home page. They show only real data (real reviews, real zones, real contact details).
   Bangla lines are labels for easier reading; the English text stays beside them. */

const Bn = ({ children, className }) => <span lang="bn" className={cn("bn", className)}>{children}</span>;

export const Stars = ({ n = 5, size = 18, className }) => (
  <span role="img" aria-label={`${n} out of 5 stars`} className={cn("inline-flex gap-0.5", className)}>
    {[1, 2, 3, 4, 5].map((k) => <Star key={k} size={size} aria-hidden="true" className={k <= n ? "fill-gold text-gold" : "fill-transparent text-gold/40"} />)}
  </span>
);

/* ---------- Text size: A / A+ / A++ (works on every page, remembered on this phone) ---------- */
const SIZES = [["100%", "Normal text"], ["112.5%", "Large text"], ["125%", "Extra large text"]];
const readSize = () => { try { return Math.min(2, Math.max(0, Number(localStorage.getItem("textSize")) || 0)); } catch { return 0; } };
const applySize = (i) => { document.documentElement.style.fontSize = SIZES[i][0]; };
if (typeof document !== "undefined") applySize(readSize()); // runs once when the site opens, so every page keeps the chosen size

/* ---------- Always-visible help bar: Call, WhatsApp, bigger text ---------- */
export function HelpDock() {
  const [size, setSize] = useState(readSize);
  const bump = () => {
    const n = (size + 1) % SIZES.length;
    setSize(n); applySize(n);
    try { localStorage.setItem("textSize", String(n)); } catch { /* storage may be blocked; the size still changes */ }
  };
  const base = "flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl text-base font-semibold shadow-lg md:h-14 md:w-14 md:flex-none md:rounded-full";
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-navy/10 bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:inset-x-auto md:bottom-5 md:right-5 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
      <div className="flex gap-2 md:flex-col-reverse">
        <a href={PHONE} aria-label={`Call us ${PHONE_DISPLAY}`} className={cn(base, "bg-navy text-white hover:bg-navy-deep")}><PhoneCall size={22} /><span className="md:hidden"><Bn>কল করুন</Bn></span></a>
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp us" className={cn(base, "bg-[#1FA855] text-white hover:bg-[#178a45]")}><MessageCircle size={22} /><span className="md:hidden">WhatsApp</span></a>
        <button type="button" onClick={bump} aria-label={`Text size: ${SIZES[size][1]}. Tap to change.`} className={cn(base, "border-2 border-navy bg-white text-navy hover:bg-sky")}>
          <Type size={22} /><span className="md:hidden"><Bn>বড় লেখা</Bn></span>
        </button>
      </div>
    </div>
  );
}

/* ---------- Review summary under the hero (only when real approved reviews exist) ---------- */
export const avgRating = (reviews) => (reviews.length ? reviews.reduce((a, r) => a + (Number(r.rating) || 5), 0) / reviews.length : 0);

export function RatingStrip({ reviews }) {
  if (!reviews.length) return null;
  const avg = avgRating(reviews);
  return (
    <a href="#reviews" className="group block bg-gold-light/60 transition hover:bg-gold-light">
      <div className="wrap flex flex-wrap items-center justify-center gap-x-5 gap-y-1 py-3.5 text-center">
        <Stars n={Math.round(avg)} size={22} />
        <span className="font-display text-lg font-semibold text-navy-deep">{avg.toFixed(1)} / 5</span>
        <span className="text-navy-deep/85">from {reviews.length} pilgrim review{reviews.length > 1 ? "s" : ""} · <Bn>রিভিউ দেখুন</Bn></span>
        <ArrowRight size={18} className="text-navy transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </div>
    </a>
  );
}

/* ---------- Big, simple buttons for the most common needs ---------- */
const TILES = [
  [PhoneCall, "bg-navy text-white", "ফোন করুন", "Call us now", PHONE_DISPLAY, PHONE],
  [MessageCircle, "bg-[#1FA855] text-white", "হোয়াটসঅ্যাপ", "WhatsApp", "Send us a message", WHATSAPP, true],
  [Calculator, "bg-accent text-navy-deep", "ওমরাহ খরচ", "Umrah cost estimate", "Choose and see the cost change", "#/estimate"],
  [Moon, "bg-navy-deep text-accent-light", "হজ্জ প্যাকেজ ২০২৭", "Hajj packages 2027", "Compare all packages", "#/packages"],
  [Star, "bg-gold text-white", "রিভিউ দেখুন", "Read reviews", "What pilgrims say", "#reviews"],
  [CalendarCheck, "bg-mid text-white", "অ্যাপয়েন্টমেন্ট", "Book a consultation", "Phone, video or office visit", "#/book"],
];

export function QuickHelp() {
  return (
    <section className="bg-pattern py-12 md:py-16" aria-labelledby="quick-help">
      <div className="wrap">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 id="quick-help" className="text-3xl md:text-4xl"><Bn>আসসালামু আলাইকুম</Bn><span className="block text-2xl font-medium md:text-3xl">How can we help you today?</span></h2>
          <p className="muted mt-3"><Bn>নিচের যেকোনো বাটনে চাপ দিন। প্রয়োজনে আমাদের সরাসরি ফোন করুন।</Bn></p>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {TILES.map(([Icon, tone, bn, en, sub, href, ext]) => (
            <a key={en} href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="tile">
              <span className={cn("tile-ico", tone)}><Icon size={28} aria-hidden="true" /></span>
              <span>
                <Bn className="block text-xl font-semibold text-navy-deep">{bn}</Bn>
                <span className="block font-display text-base font-semibold text-navy">{en}</span>
                <span className="muted block text-sm">{sub}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Four easy steps ---------- */
const STEPS = [
  [PhoneCall, "যোগাযোগ করুন", "Call or message us", "Tell us if you are thinking of Umrah or Hajj. No forms are needed."],
  [HeartHandshake, "পরামর্শ নিন", "Talk to an advisor", "We help you choose a package, or you can try the Hajj finder yourself."],
  [ListChecks, "লিখিত কোটেশন", "Get a written quotation", "You receive a confirmed written quotation before any payment."],
  [ShieldCheck, "সিদ্ধান্ত নিন", "Confirm when you are ready", "Take your time. Book only when you are happy with the plan."],
];

export function EasySteps() {
  return (
    <Section tone="sky" id="how">
      <SectionTitle eyebrow="Simple for everyone"><Bn>মাত্র ৪টি সহজ ধাপ</Bn><span className="block text-2xl font-medium md:text-3xl">4 easy steps</span></SectionTitle>
      <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(([Icon, bn, en, d], i) => (
          <li key={en} className="relative rounded-3xl border-2 border-mid/25 bg-white p-6 shadow-sm">
            <span className="absolute -top-4 left-5 flex h-10 w-10 items-center justify-center rounded-full bg-navy font-display text-lg font-semibold text-white" aria-hidden="true">{i + 1}</span>
            <Icon className="mt-2 text-mid" size={32} aria-hidden="true" />
            <Bn className="mt-3 block text-xl font-semibold text-navy-deep">{bn}</Bn>
            <h3 className="font-display text-base font-semibold text-navy">{en}</h3>
            <p className="muted mt-2 text-sm">{d}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href={PHONE}><Phone size={18} />{PHONE_DISPLAY}</LinkButton>
        <LinkButton href="#/book" variant="navy">Book a consultation</LinkButton>
      </div>
    </Section>
  );
}

/* ---------- Reviews: big readable cards, large arrows, swipe or tap ---------- */
const initials = (n = "") => n.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function ReviewsShowcase({ reviews }) {
  const row = useRef(null);
  const go = (dir) => {
    const el = row.current;
    if (!el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: calm ? "auto" : "smooth" });
  };
  const avg = avgRating(reviews);
  return (
    <Section id="reviews" className="bg-gradient-to-b from-gold-light/40 to-cream">
      <SectionTitle eyebrow="Reviews & stories"><Bn>হাজী ও ওমরাহ যাত্রীদের কথা</Bn><span className="block text-2xl font-medium md:text-3xl">What pilgrims say</span></SectionTitle>
      {reviews.length ? (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <div className="rounded-3xl border-2 border-gold/40 bg-white p-6 text-center shadow-sm">
            <p className="font-display text-6xl font-semibold text-navy-deep">{avg.toFixed(1)}</p>
            <Stars n={Math.round(avg)} size={26} className="mt-2" />
            <p className="muted mt-2 text-sm">Average of {reviews.length} moderated review{reviews.length > 1 ? "s" : ""}</p>
            <div className="mt-5 hidden justify-center gap-3 lg:flex">
              <button type="button" onClick={() => go(-1)} aria-label="Previous reviews" className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-navy text-navy hover:bg-sky"><ChevronLeft size={28} /></button>
              <button type="button" onClick={() => go(1)} aria-label="Next reviews" className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white hover:bg-navy-deep"><ChevronRight size={28} /></button>
            </div>
          </div>
          <div>
            <div ref={row} tabIndex={0} role="region" aria-label="Pilgrim reviews. Swipe sideways or use the arrow buttons." className="snap-row scrollbar-hide flex gap-5 overflow-x-auto pb-3">
              {reviews.map((r) => (
                <article key={r.id ?? r.name + r.text} className="relative flex shrink-0 basis-[88%] flex-col rounded-3xl border-2 border-mid/25 bg-white p-6 shadow-sm sm:basis-[60%] xl:basis-[46%]">
                  <Quote className="absolute right-5 top-5 text-gold/50" size={36} aria-hidden="true" />
                  <Stars n={Math.min(5, Math.max(1, Number(r.rating) || 5))} size={22} />
                  <p className="mt-4 text-lg leading-relaxed text-navy-deep">{r.text}</p>
                  <div className="mt-auto flex items-center gap-3 pt-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky font-semibold text-navy" aria-hidden="true">{initials(r.name)}</span>
                    <div><p className="text-base font-semibold text-navy-deep">{r.name}</p><p className="faint">Moderated review</p></div>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 lg:justify-start">
              <p className="muted text-sm"><Bn>পাশে সরিয়ে আরও দেখুন</Bn> · Swipe to read more</p>
              <div className="flex gap-3 lg:hidden">
                <button type="button" onClick={() => go(-1)} aria-label="Previous reviews" className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-navy text-navy"><ChevronLeft size={28} /></button>
                <button type="button" onClick={() => go(1)} aria-label="Next reviews" className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white"><ChevronRight size={28} /></button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-3xl border-2 border-dashed border-gold/60 bg-white p-8 text-center">
          <Stars n={5} size={30} className="justify-center" />
          <p className="mt-4 text-lg text-navy-deep">Published reviews and success stories will appear here after moderation and consent.</p>
          <p className="muted mt-2"><Bn>আপনি চাইলে আমাদের সরাসরি ফোন করে কথা বলতে পারেন।</Bn></p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <LinkButton href={PHONE}><Phone size={18} />Call us</LinkButton>
            <LinkButton href={WHATSAPP} target="_blank" rel="noopener noreferrer" variant="outline"><MessageCircle size={18} />WhatsApp</LinkButton>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ---------- Hotels & distance guide: one short card (replaces the old two-card "guides" block) ---------- */
export function HotelGuide() {
  return (
    <section className="wrap section defer" aria-labelledby="hotel-guide">
      <div className="overflow-hidden rounded-3xl border-2 border-mid/25 bg-gradient-to-br from-sky to-white shadow-sm">
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <span className="tile-ico bg-navy text-accent-light"><Building2 size={28} aria-hidden="true" /></span>
            <h2 id="hotel-guide" className="mt-4 text-2xl md:text-3xl"><Bn>হোটেল ও দূরত্বের গাইড</Bn><span className="block text-xl font-medium md:text-2xl">Hotels &amp; distance guide</span></h2>
            <p className="muted mt-3 max-w-xl">See hotel names, map pins and walking-route distances to Masjid al-Haram and Masjid an-Nabawi. Walking times are estimates, not guarantees.</p>
            <p className="mt-3 max-w-xl"><Bn className="text-navy-deep">হোটেল থেকে মসজিদের দূরত্ব কত, হেঁটে কতক্ষণ লাগবে, সব এক জায়গায় দেখুন।</Bn></p>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Distance zones">
              {ZONES.map((z) => <span key={z.code} style={{ background: z.color }} className="rounded-full px-3 py-1 text-sm font-semibold text-white">Zone {z.code}</span>)}
            </div>
          </div>
          <div className="flex flex-col gap-3 md:min-w-[220px]">
            <LinkButton href="#/hotels" variant="navy">Browse hotels <ArrowRight size={16} /></LinkButton>
            <LinkButton href="#/zones" variant="outline">Distance &amp; zones</LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ as big open cards: English + Bangla, no tapping needed ---------- */
// items: [[question, answer, questionBn, answerBn], ...]
export function FaqCards({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <Section id="faq" tone="sky">
      <SectionTitle eyebrow="FAQ"><Bn>সাধারণ প্রশ্ন ও উত্তর</Bn><span className="block text-2xl font-medium md:text-3xl">Common questions</span></SectionTitle>
      <div className="mx-auto grid max-w-5xl items-start gap-4 md:grid-cols-2">
        {items.map(([q, a, qbn, abn], i) => {
          const isOpen = open === i;
          return (
            <article key={q} className="rounded-3xl border-2 border-mid/25 bg-white shadow-sm">
              <button type="button" id={`faq-q-${i}`} aria-expanded={isOpen} aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-4 rounded-3xl p-5 text-left md:p-6">
                <span className="tile-ico shrink-0 bg-navy text-accent-light" aria-hidden="true"><CircleHelp size={28} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-semibold leading-snug text-navy-deep">{q}</span>
                  {qbn && <Bn className="mt-1 block text-lg font-semibold leading-snug text-navy">{qbn}</Bn>}
                </span>
                <ChevronDown size={26} aria-hidden="true" className={cn("shrink-0 text-navy transition-transform duration-200", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="px-5 pb-5 md:px-6 md:pb-6">
                  <div className="space-y-3 rounded-2xl bg-sky p-4">
                    <p className="text-navy-deep"><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-mid">Answer</span>{a}</p>
                    {abn && <p className="border-t border-mid/30 pt-3 text-navy-deep"><Bn className="mb-1 block text-xs font-semibold text-mid">উত্তর</Bn><Bn>{abn}</Bn></p>}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
      <div className="mx-auto mt-8 max-w-2xl rounded-3xl border-2 border-gold/40 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-navy-deep"><Bn>আরও প্রশ্ন আছে? আমাদের সরাসরি ফোন করুন।</Bn></p>
        <p className="muted">Still have a question? Speak to us directly.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <LinkButton href={PHONE}><Phone size={18} />{PHONE_DISPLAY}</LinkButton>
          <LinkButton href={WHATSAPP} target="_blank" rel="noopener noreferrer" variant="outline"><MessageCircle size={18} />WhatsApp</LinkButton>
        </div>
      </div>
    </Section>
  );
}
