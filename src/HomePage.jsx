import { useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, useInView } from "framer-motion";
import { ArrowRight, BadgeCheck, BookOpen, CalendarDays, Info, MapPin, MessageCircle, Phone, Route, Star, Users } from "lucide-react";
import { Testimonials } from "@/components/ui/testimonials";
import { PACKAGES } from "@/data";
import { PackageCarouselCard } from "@/components/PackageCarouselCard";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import { Section, SectionTitle, LinkButton } from "@/components/ui/kit";
import { Header, Footer } from "@/Layout";
import { WHATSAPP, PHONE, LICENCE, API } from "@/config";
import { safeHttps, taka, fmtDate, DIST_METHOD } from "@/lib/utils";
import { useGet } from "@/lib/hooks";

const HERO_IMAGES = [1, 2, 3, 4, 5].map((n) => ({ src: `/media/hero-${n}-1600.webp`, set: `/media/hero-${n}-900.webp 900w, /media/hero-${n}-1600.webp 1600w` }));
const SLIDE_MS = 10000;

const fmtPackage = (p) => ({
  id: p.id,
  type: p.kind === "hajj" ? "Hajj" : "Umrah",
  title: p.title,
  date: fmtDate(p.departure_date, "short"),
  hotel: p.hotel_name || "Hotel to be confirmed",
  dist: p.distance_m ? `${p.distance_m} m (${DIST_METHOD[p.distance_method] || DIST_METHOD.unverified})` : "Distance to be confirmed",
  price: p.price_bdt ? taka(Number(p.price_bdt)) : "Price on request",
  seats: p.seats_remaining, // shown only when staff maintain a real count
});

const FAQ = [
  ["What is the difference between shifting and non-shifting Hajj?", "A shifting package includes a planned change of accommodation during the programme. A non-shifting package is designed to keep you in the stated accommodation, subject to the itinerary and official arrangements. Always check the schedule listed for each package."],
  ["Are package prices final?", "No. Starting prices are estimates and can change with flights, hotel availability, occupancy and exchange rates. We provide a written confirmed quotation before any payment."],
  ["What does '300 metres from the Haram' mean?", "It is the stated distance from the hotel to the relevant point at the Masjid. We label whether it is a walking-route or straight-line figure. Actual walking time varies."],
  ["How do I know you are licensed?", "Our licence details are on this page and linked to the official government directory so you can verify them yourself."],
];

const JOURNEYS = [
  ["umrah", "Umrah", "Customize your own trip and see the cost change as you choose.", [["Group Umrah dates", "#/group-umrah"], ["Estimate my Umrah", "#/estimate"]]],
  ["hajj", "Hajj", "Compare shifting and non-shifting packages, or let the finder pick the closest match.", [["Find my Hajj", "#/find-your-hajj"], ["All packages", "#/packages"]]],
];
const GUIDES = [
  [Route, "Hotels & distance guide", "See hotel names, map pins and walking-route distances to Masjid al-Haram and Masjid an-Nabawi. Walking times are estimates, not guarantees.", ["#/hotels", "Browse hotels"]],
  [BookOpen, "History & Ziyarah", "Learn about the sacred sites of Makkah and Madinah with reviewed, sourced descriptions and maps."],
];
const TRUST = [
  [BadgeCheck, "Verified licence", "Licence details linked to the official government directory."],
  [Users, "Shariah board", "Profiles of our scholars and the guidance they provide."],
  [BookOpen, "Past trips archive", "Every completed departure stays on record."],
  [Star, "Genuine reviews", "Moderated reviews from real pilgrims only."],
];
const stars = (r) => "★".repeat(Math.min(5, Math.max(1, r || 5)));

/* ================= Hero ================= */
const WordsPullUp = ({ text }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="inline-flex flex-wrap">
      {text.split(" ").map((w, i) => (
        <m.span key={i} className="mr-[0.25em] inline-block" initial={{ y: 24, opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}>{w}</m.span>
      ))}
    </div>
  );
};

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

const FadeUp = ({ delay, className, children, as: Tag = m.div }) => (
  <Tag initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay }} className={className}>{children}</Tag>
);

function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[560px] w-full p-2 sm:p-3">
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-navy-deep md:rounded-[2rem]">
        <img src="/mosque-scene.svg" alt="" className="absolute inset-0 h-full w-full object-cover object-bottom" />
        <HeroSlides />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/60 via-navy-deep/10 to-navy-deep/90" />
        <Header overlay />
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-12 items-end gap-4 px-4 pb-6 sm:px-6 md:px-10 md:pb-10">
          <h1 className="col-span-12 text-[17vw] font-medium leading-[0.9] text-white sm:text-[13vw] lg:col-span-8 lg:text-[10vw]"><WordsPullUp text="Hajj & Umrah" /></h1>
          <div className="col-span-12 flex flex-col gap-5 lg:col-span-4">
            <FadeUp as={m.p} delay={0.5} className="text-sm text-white/80 md:text-base">
              Trusted, licensed guidance for pilgrims from Bangladesh. Compare packages, hotels and distances, then speak to an advisor for a confirmed quotation.
            </FadeUp>
            <FadeUp delay={0.7} className="flex flex-wrap gap-3">
              {[["Explore Umrah", "#umrah", "accent"], ["Explore Hajj", "#hajj", "ghost-light"]].map(([l, h, v]) => (
                <LinkButton key={l} href={h} variant={v} className="group !py-1 !pl-5 !pr-1 hover:gap-3">
                  {l}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-deep text-accent-light transition-transform group-hover:scale-110"><ArrowRight className="h-4 w-4" /></span>
                </LinkButton>
              ))}
            </FadeUp>
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
  const cls = "field field-dark";
  return (
    <form onSubmit={submit} className="mx-auto mt-10 grid max-w-xl gap-3 text-left">
      <input required aria-label="Your name" autoComplete="name" className={cls} placeholder="Your name" value={f.name} onChange={set("name")} />
      <input required aria-label="Phone or WhatsApp" type="tel" autoComplete="tel" className={cls} placeholder="Phone / WhatsApp" value={f.phone} onChange={set("phone")} />
      <select aria-label="Interested in" className={cls} value={f.kind} onChange={set("kind")}>
        <option value="umrah" className="text-navy-deep">Umrah</option>
        <option value="hajj" className="text-navy-deep">Hajj</option>
      </select>
      <textarea rows={3} aria-label="Message" className={cls} placeholder="Preferred dates, hotel, budget (optional)" value={f.message} onChange={set("message")} />
      <button disabled={st === "sending"} className="btn btn-accent">{st === "sending" ? "Sending…" : "Request confirmed quotation"}</button>
      {st === "done" && <p role="status" className="text-center text-sm text-accent-light">Thank you. Our team will contact you to confirm availability and pricing.</p>}
      {st === "error" && <p role="alert" className="text-center text-sm text-red-300">Could not send. Please try again or use WhatsApp.</p>}
    </form>
  );
}

const DepartureCard = ({ p }) => (
  <article className="panel panel-lift flex flex-col">
    <span className="pill pill-dark">{p.type}</span>
    <h3 className="mt-4 text-xl">{p.title}</h3>
    <ul className="mt-4 space-y-2 text-sm text-navy-deep/75">
      <li className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-mid" />{p.date}</li>
      <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-mid" />{p.hotel} · {p.dist}</li>
    </ul>
    <div className="mt-auto pt-6">
      <p className="faint">Starting from (estimate)</p>
      <p className="price">{p.price}</p>
      {p.seats != null && <p className="text-xs text-mid">{p.seats} seats left</p>}
      <LinkButton href={`#/book?kind=${p.type.toLowerCase()}`} block className="mt-4">Request quotation</LinkButton>
    </div>
  </article>
);

/* ================= Page ================= */
export default function HomePage() {
  const { data: pk } = useGet("/packages/?status=open");
  const { data: rv } = useGet("/reviews/");
  const packages = Array.isArray(pk) ? pk.map(fmtPackage) : [];
  const reviews = Array.isArray(rv) ? rv : [];
  const verify = safeHttps(LICENCE.verifyUrl);
  return (
    <LazyMotion features={domAnimation}>
      <main className="bg-cream">
        <Hero />

        <Section>
          <SectionTitle eyebrow="Choose your journey">Umrah or Hajj</SectionTitle>
          <div className="grid gap-5 md:grid-cols-2">
            {JOURNEYS.map(([id, t, d, a]) => (
              <article key={id} id={id} className="rounded-3xl border border-mid/30 bg-gradient-to-br from-sky to-white p-6 shadow-sm md:p-10">
                <h3 className="text-3xl md:text-4xl">{t}</h3>
                <p className="muted mt-3">{d}</p>
                <div className="mt-6 flex flex-wrap gap-3">{a.map(([x, h]) => <LinkButton key={x} href={h} variant="navy" small>{x}</LinkButton>)}</div>
              </article>
            ))}
          </div>
        </Section>

        <AnimatedMarqueeHero
          id="packages"
          tagline={`${PACKAGES.length} Hajj 2027 packages`}
          title="Find the Hajj package that fits you"
          description="Shifting and non-shifting, from the closest hotels to the most affordable. Hover to pause, then open any programme."
          cta={
            <div className="flex flex-wrap items-center justify-center gap-4">
              <LinkButton href="#/packages" className="px-7 shadow-lg">See all {PACKAGES.length} packages <ArrowRight size={16} /></LinkButton>
              <a href="#/find-your-hajj" className="link text-sm font-medium">Not sure? Use the Hajj finder</a>
            </div>
          }
          items={PACKAGES.map((p, i) => <PackageCarouselCard key={p.slug} p={p} index={i} />)}
        />

        <Section tone="sky" className="!pt-0">
          <div className="mx-auto mb-12 flex max-w-2xl items-start justify-center gap-3 rounded-2xl border border-mid/30 bg-white px-6 py-4 text-center shadow-sm md:mb-16">
            <Info size={18} className="mt-0.5 shrink-0 text-mid" />
            <p className="text-sm text-navy-deep/75">Prices are estimates. A written quotation is provided after availability is confirmed.</p>
          </div>
          {packages.length > 0 && (
            <>
              <SectionTitle eyebrow="Open for booking">Upcoming departures</SectionTitle>
              <div className="grid-cards">{packages.map((p) => <DepartureCard key={p.id} p={p} />)}</div>
            </>
          )}
        </Section>

        <section className="wrap section defer grid gap-5 md:grid-cols-2">
          {GUIDES.map(([I, t, d, link]) => (
            <article key={t} className="panel md:!p-8">
              <I className="text-mid" size={28} />
              <h3 className="mt-4 text-2xl">{t}</h3>
              <p className="muted mt-2">{d}</p>
              {link ? <a href={link[0]} className="btn-text mt-5">{link[1]} <ArrowRight size={16} /></a> : <span className="faint mt-5 inline-block text-sm">Coming soon</span>}
            </article>
          ))}
        </section>

        <Section id="trust" tone="sky">
          <SectionTitle eyebrow="Trust centre">Why pilgrims trust us</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map(([I, t, d]) => (
              <div key={t} className="panel">
                <I className="text-mid" size={28} />
                <h3 className="mt-4 text-lg">{t}</h3>
                <p className="muted mt-2 text-sm">{d}</p>
              </div>
            ))}
          </div>
          <p className="muted mt-6 text-sm">
            {LICENCE.number && <>Licence no.: <b>{LICENCE.number}</b> · </>}
            {verify && <><a href={verify} target="_blank" rel="noopener noreferrer" className="link">Verify our licence</a> · </>}
            <a href="#/trust" className="link">Open the Trust Centre</a>
          </p>
        </Section>

        {/* Reviews: only real, moderated reviews are shown. Nothing is invented. */}
        <Section id="reviews">
          {reviews.length ? (
            <Testimonials title="What pilgrims say" description="Moderated reviews from pilgrims who travelled with us."
              testimonials={reviews.map((r) => ({ name: r.name, username: stars(r.rating), text: r.text }))} />
          ) : (
            <>
              <SectionTitle eyebrow="Reviews & stories">What pilgrims say</SectionTitle>
              <div className="panel-empty">Published reviews and success stories will appear here after moderation and consent.</div>
            </>
          )}
        </Section>

        <Section id="faq" tone="sky" narrow>
          <SectionTitle eyebrow="FAQ">Common questions</SectionTitle>
          <div className="space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group panel !p-5">
                <summary className="flex items-center justify-between gap-3 font-medium text-navy">{q}<span aria-hidden="true" className="text-mid transition-transform group-open:rotate-45">+</span></summary>
                <p className="mt-3 text-sm text-navy-deep/75">{a}</p>
              </details>
            ))}
          </div>
        </Section>

        <section id="contact" className="defer p-2 sm:p-3">
          <div className="rounded-2xl bg-navy-deep px-6 py-16 text-center text-white md:rounded-[2rem] md:py-24">
            <h2 className="mx-auto max-w-2xl text-3xl text-white md:text-5xl">Speak with an advisor about your journey</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">Book a consultation or message us directly. We reply with a confirmed quotation.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkButton href="#/book">Book appointment</LinkButton>
              <LinkButton href={WHATSAPP} target="_blank" rel="noopener noreferrer" variant="ghost-light"><MessageCircle size={16} />WhatsApp</LinkButton>
              <LinkButton href={PHONE} variant="ghost-light"><Phone size={16} />Call us</LinkButton>
            </div>
            <EnquiryForm />
          </div>
        </section>

        <Footer className="mt-0" />
      </main>
    </LazyMotion>
  );
}
