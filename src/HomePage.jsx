import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, BadgeCheck, BookOpen, CalendarDays, MapPin, Menu, MessageCircle,
  Phone, Route, Star, Users, X,
} from "lucide-react";
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";
import { PACKAGES } from "@/data";
import { PackageCard } from "@/components/PackageCard";
import { WHATSAPP, PHONE, LICENCE } from "@/config";
import { safeHttps } from "@/lib/utils";


const HERO_IMAGES = [1, 2, 3, 4, 5].map((n) => ({ src: `/media/hero-${n}-1600.webp`, set: `/media/hero-${n}-900.webp 900w, /media/hero-${n}-1600.webp 1600w` }));
const SLIDE_MS = 10000;

const API = import.meta.env.VITE_API_URL || "/api";
const METHOD = { walking: "walking route", straight: "straight line", unverified: "approx., route not verified" };
const fmtPackage = (p) => ({
  id: p.id,
  type: p.kind === "hajj" ? "Hajj" : "Umrah",
  title: p.title,
  date: p.departure_date ? new Date(p.departure_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Date to be confirmed",
  hotel: p.hotel_name || "Hotel to be confirmed",
  dist: p.distance_m ? `${p.distance_m} m (${METHOD[p.distance_method]})` : "Distance to be confirmed",
  price: p.price_bdt ? `৳ ${Number(p.price_bdt).toLocaleString("en-IN")}` : "Price on request",
  seats: p.seats_remaining, // shown only when staff maintain a real count
});

const FAQ = [
  ["What is the difference between shifting and non-shifting Hajj?", "A shifting package includes a planned change of accommodation during the programme. A non-shifting package is designed to keep you in the stated accommodation, subject to the itinerary and official arrangements. Always check the schedule listed for each package."],
  ["Are package prices final?", "No. Starting prices are estimates and can change with flights, hotel availability, occupancy and exchange rates. We provide a written confirmed quotation before any payment."],
  ["What does '300 metres from the Haram' mean?", "It is the stated distance from the hotel to the relevant point at the Masjid. We label whether it is a walking-route or straight-line figure. Actual walking time varies."],
  ["How do I know you are licensed?", "Our licence details are on this page and linked to the official government directory so you can verify them yourself."],
];
const NAV = [["Umrah", "#/estimate"], ["Hajj", "#/find-your-hajj"], ["Packages", "#/packages"], ["Group Umrah", "#/group-umrah"], ["Hotels", "#/hotels"], ["Trust", "#/trust"], ["FAQ", "#faq"]];

/* ================= Helpers ================= */
const WordsPullUp = ({ text, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {text.split(" ").map((w, i) => (
        <motion.span key={i} className="inline-block" style={{ marginRight: "0.25em" }}
          initial={{ y: 24, opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}>{w}</motion.span>
      ))}
    </div>
  );
};

const Title = ({ eyebrow, children }) => (
  <div className="mb-8 md:mb-12">
    <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-mid">{eyebrow}</p>
    <h2 className="font-display text-3xl text-navy md:text-5xl">{children}</h2>
  </div>
);

function HeroSlides() {
  const [i, setI] = useState(0);
  const [bad, setBad] = useState([]); // missing files are skipped
  const alive = HERO_IMAGES.map((_, k) => k).filter((k) => !bad.includes(k));
  const cur = alive.includes(i) ? i : alive[0];
  const next = alive[(alive.indexOf(cur) + 1) % alive.length];
  useEffect(() => {
    if (alive.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => alive[(alive.indexOf(alive.includes(n) ? n : alive[0]) + 1) % alive.length]), SLIDE_MS);
    return () => clearInterval(t);
  }, [alive.join()]);
  // Only the visible slide and the one after it are in the page, so a phone does not download all five photos at once.
  const [seen, setSeen] = useState([]);
  useEffect(() => { setSeen((s) => [...new Set([...s, cur, next])]); }, [cur, next]);
  return HERO_IMAGES.map((img, k) => (seen.includes(k) || k === cur) && (
    <img key={img.src} src={img.src} srcSet={img.set} sizes="100vw" alt="" decoding="async"
      {...(k === 0 ? { fetchpriority: "high" } : {})}
      hidden={bad.includes(k)} onError={() => setBad((b) => (b.includes(k) ? b : [...b, k]))}
      className={`slide absolute inset-0 h-full w-full object-cover${k === cur ? " on" : ""}`} />
  ));
}

/* ================= Hero ================= */
function Hero() {
  const [open, setOpen] = useState(false);
  return (
    <section className="relative h-[100svh] min-h-[560px] w-full p-2 sm:p-3">
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-navy-deep md:rounded-[2rem]">
        <img src="/mosque-scene.svg" alt="" className="absolute inset-0 h-full w-full object-cover object-bottom" />
        <HeroSlides />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/60 via-navy-deep/10 to-navy-deep/90" />

        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 md:px-8">
          <a href="#/" aria-label="Own The World – Hajj & Umrah">
            <img src="/logo.webp" width="66" height="56" alt="Own The World – Hajj & Umrah" className="h-12 w-auto rounded-xl bg-white p-1 shadow-lg sm:h-14" />
          </a>
          <nav className="hidden gap-8 rounded-full bg-navy-deep/80 px-8 py-2.5 backdrop-blur lg:flex">
            {NAV.map(([l, h]) => <a key={h} href={h} className="text-sm text-white/80 transition-colors hover:text-accent-light">{l}</a>)}
          </nav>
          <a href="#/book" className="hidden rounded-full bg-accent px-5 py-2 text-sm font-medium text-navy-deep transition hover:bg-accent-light md:block">Book consultation</a>
          <button aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-full bg-navy-deep/80 p-2 text-white md:hidden">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        {open && (
          <div className="absolute inset-x-4 top-16 z-30 flex flex-col gap-1 rounded-2xl bg-navy-deep p-4 md:hidden">
            {NAV.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-white/90 hover:bg-white/10">{l}</a>)}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 grid grid-cols-12 items-end gap-4 px-4 pb-6 sm:px-6 md:px-10 md:pb-10">
          <h1 className="col-span-12 font-display font-medium leading-[0.9] tracking-tight text-white text-[17vw] sm:text-[13vw] lg:col-span-8 lg:text-[10vw]">
            <WordsPullUp text="Hajj & Umrah" />
          </h1>
          <div className="col-span-12 flex flex-col gap-5 lg:col-span-4">
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-sm text-white/80 md:text-base">
              Trusted, licensed guidance for pilgrims from Bangladesh. Compare packages, hotels and distances, then speak to an advisor for a confirmed quotation.
            </motion.p>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex flex-wrap gap-3">
              {[["Explore Umrah", "#umrah", true], ["Explore Hajj", "#hajj", false]].map(([l, h, p]) => (
                <a key={l} href={h} className={`group inline-flex items-center gap-2 rounded-full py-1 pl-5 pr-1 text-sm font-medium transition-all hover:gap-3 ${p ? "bg-accent text-navy-deep" : "border border-white/40 text-white"}`}>
                  {l}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-deep text-accent-light transition-transform group-hover:scale-110"><ArrowRight className="h-4 w-4" /></span>
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= Enquiry form (POST /api/enquiries/) ================= */
function EnquiryForm() {
  const blank = { name: "", phone: "", kind: "umrah", message: "" };
  const [f, setF] = useState(blank);
  const [st, setSt] = useState("idle");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setSt("sending");
    try {
      const r = await fetch(`${API}/enquiries/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      setSt(r.ok ? "done" : "error");
      if (r.ok) setF(blank);
    } catch { setSt("error"); }
  };
  const inp = "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 focus:border-mid focus:outline-none";
  return (
    <form onSubmit={submit} className="mx-auto mt-10 grid max-w-xl gap-3 text-left">
      <input required className={inp} placeholder="Your name" value={f.name} onChange={set("name")} />
      <input required className={inp} placeholder="Phone / WhatsApp" value={f.phone} onChange={set("phone")} />
      <select className={inp} value={f.kind} onChange={set("kind")}>
        <option value="umrah" className="text-navy-deep">Umrah</option>
        <option value="hajj" className="text-navy-deep">Hajj</option>
      </select>
      <textarea rows={3} className={inp} placeholder="Preferred dates, hotel, budget (optional)" value={f.message} onChange={set("message")} />
      <button disabled={st === "sending"} className="rounded-full bg-accent py-3 text-sm font-medium text-navy-deep hover:bg-accent-light disabled:opacity-60">
        {st === "sending" ? "Sending…" : "Request confirmed quotation"}
      </button>
      {st === "done" && <p role="status" className="text-center text-sm text-accent-light">Thank you. Our team will contact you to confirm availability and pricing.</p>}
      {st === "error" && <p role="alert" className="text-center text-sm text-red-300">Could not send. Please try again or use WhatsApp.</p>}
    </form>
  );
}

/* ================= Page ================= */
export default function HomePage() {
  const [packages, setPackages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const featured = ["exclusive-hajj-2027", "standard-hajj-2027", "short-nonshifting-b-2027"].map((sl) => PACKAGES.find((p) => p.slug === sl));
  useEffect(() => {
    const get = (u) => fetch(`${API}${u}`).then((r) => (r.ok ? r.json() : []));
    get("/packages/?status=open").then((d) => setPackages(d.map(fmtPackage))).catch(() => {});
    get("/reviews/").then(setReviews).catch(() => {});
  }, []);
  return (
    <main className="bg-cream font-sans text-navy-deep">
      <Hero />

      {/* Umrah / Hajj entry */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <Title eyebrow="Choose your journey">Umrah or Hajj</Title>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ["umrah", "Umrah", "Customize your own trip and see the cost change as you choose.", [["Group Umrah dates", "#/group-umrah"], ["Estimate my Umrah", "#/estimate"]]],
            ["hajj", "Hajj", "Compare shifting and non-shifting packages, or let the finder pick the closest match.", [["Find my Hajj", "#/find-your-hajj"], ["All packages", "#/packages"]]],
          ].map(([id, t, d, a]) => (
            <article key={id} id={id} className="rounded-3xl border border-mid/30 bg-gradient-to-br from-sky to-white p-6 shadow-sm md:p-10">
              <h3 className="font-display text-3xl text-navy md:text-4xl">{t}</h3>
              <p className="mt-3 text-navy-deep/70">{d}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {a.map(([x, h]) => <a key={x} href={h} className="rounded-full bg-navy px-5 py-2.5 text-sm text-white transition hover:bg-navy-deep">{x}</a>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="bg-sky py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Title eyebrow="Featured packages">Upcoming departures</Title>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packages.length === 0 && featured.map((p) => <PackageCard key={p.slug} p={p} />)}
            {packages.map((p) => (
              <article key={p.id} className="flex flex-col rounded-2xl border border-mid/30 bg-white p-6 shadow-sm">
                <span className="w-fit rounded-full bg-navy px-3 py-1 text-xs text-accent-light">{p.type}</span>
                <h3 className="mt-4 font-display text-xl text-navy">{p.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-navy-deep/75">
                  <li className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-mid" />{p.date}</li>
                  <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-mid" />{p.hotel} · {p.dist}</li>
                </ul>
                <div className="mt-auto pt-6">
                  <p className="text-xs text-navy-deep/60">Starting from (estimate)</p>
                  <p className="font-display text-2xl text-navy">{p.price}</p>
                  {p.seats != null && <p className="text-xs text-mid">{p.seats} seats left</p>}
                  <a href="#/book?kind=umrah" className="mt-4 block rounded-full bg-accent py-2.5 text-center text-sm font-medium text-navy-deep transition hover:bg-accent-light">Request quotation</a>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4"><a href="#/packages" className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm text-white hover:bg-navy-deep">See all {PACKAGES.length} packages <ArrowRight size={16} /></a><a href="#/find-your-hajj" className="text-sm font-medium text-navy underline">Not sure? Use the Hajj finder</a></div>
          <p className="mt-6 text-xs text-navy-deep/60">Prices are estimates. A written quotation is provided after availability is confirmed.</p>
        </div>
      </section>

      {/* Hotels & distance + Ziyarah teasers */}
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
        {[
          [Route, "Hotels & distance guide", "See hotel names, map pins and walking-route distances to Masjid al-Haram and Masjid an-Nabawi. Walking times are estimates, not guarantees."],
          [BookOpen, "History & Ziyarah", "Learn about the sacred sites of Makkah and Madinah with reviewed, sourced descriptions and maps."],
        ].map(([I, t, d]) => (
          <article key={t} className="rounded-2xl border border-mid/30 bg-white p-6 md:p-8">
            <I className="text-mid" size={28} />
            <h3 className="mt-4 font-display text-2xl text-navy">{t}</h3>
            <p className="mt-2 text-navy-deep/70">{d}</p>
            {t.startsWith("Hotels")
              ? <a href="#/hotels" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-mid">Browse hotels <ArrowRight size={16} /></a>
              : <span className="mt-5 inline-block text-sm text-navy-deep/60">Coming soon</span>}
          </article>
        ))}
      </section>

      {/* Trust */}
      <section id="trust" className="bg-sky py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Title eyebrow="Trust centre">Why pilgrims trust us</Title>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [BadgeCheck, "Verified licence", "Licence details linked to the official government directory."],
              [Users, "Shariah board", "Profiles of our scholars and the guidance they provide."],
              [BookOpen, "Past trips archive", "Every completed departure stays on record."],
              [Star, "Genuine reviews", "Moderated reviews from real pilgrims only."],
            ].map(([I, t, d]) => (
              <div key={t} className="rounded-2xl border border-mid/30 bg-white p-6">
                <I className="text-mid" size={28} />
                <h3 className="mt-4 font-display text-lg text-navy">{t}</h3>
                <p className="mt-2 text-sm text-navy-deep/70">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-navy-deep/70">{LICENCE.number ? <>Licence no.: <b>{LICENCE.number}</b> · </> : null}{safeHttps(LICENCE.verifyUrl) ? <><a href={safeHttps(LICENCE.verifyUrl)} target="_blank" rel="noopener noreferrer" className="text-navy underline">Verify our licence</a> · </> : null}<a href="#/trust" className="text-navy underline">Open the Trust Centre</a></p>
        </div>
      </section>

      {/* Reviews: only real, moderated reviews are shown. Nothing is invented. */}
      {reviews.length ? (
        <TestimonialsSection
          id="reviews"
          title="What pilgrims say"
          description="Moderated reviews from pilgrims who travelled with us."
          testimonials={reviews.map((r) => ({ author: { name: r.name, handle: "★".repeat(r.rating || 5) }, text: r.text }))}
        />
      ) : (
        <section id="reviews" className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <Title eyebrow="Reviews & stories">What pilgrims say</Title>
          <div className="rounded-2xl border border-dashed border-mid/60 bg-white p-8 text-center text-navy-deep/70">
            Published reviews and success stories will appear here after moderation and consent.
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="bg-sky py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <Title eyebrow="FAQ">Common questions</Title>
          <div className="space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group rounded-xl border border-mid/30 bg-white p-5">
                <summary className="cursor-pointer list-none font-medium text-navy marker:content-none">{q}</summary>
                <p className="mt-3 text-sm text-navy-deep/75">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="p-2 sm:p-3">
        <div className="rounded-2xl bg-navy-deep px-6 py-16 text-center text-white md:rounded-[2rem] md:py-24">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-5xl">Speak with an advisor about your journey</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">Book a consultation or message us directly. We reply with a confirmed quotation.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#/book" className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-navy-deep hover:bg-accent-light">Book appointment</a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm hover:bg-white/10"><MessageCircle size={16} />WhatsApp</a>
            <a href={PHONE} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm hover:bg-white/10"><Phone size={16} />Call us</a>
          </div>
          <EnquiryForm />
        </div>
      </section>

      <footer className="flex flex-col items-center gap-3 px-4 py-8 text-center text-xs text-navy-deep/60">
        <img src="/logo.webp" width="75" height="64" alt="" loading="lazy" className="h-16 w-auto" />
        © {new Date().getFullYear()} Own The World – Hajj &amp; Umrah. All rights reserved.
      </footer>
    </main>
  );
}
