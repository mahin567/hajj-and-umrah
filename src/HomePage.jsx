import { useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, useInView } from "framer-motion";
import { ArrowRight, BadgeCheck, BookOpen, CalendarDays, Info, MapPin, MessageCircle, Phone, Star, Users } from "lucide-react";
import { HelpDock, QuickHelp, RatingStrip, EasySteps, ReviewsShowcase, HotelGuide, FaqCards } from "@/components/home/HomeExtras";
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
  ["What is the difference between shifting and non-shifting Hajj?", "A shifting package includes a planned change of accommodation during the programme. A non-shifting package is designed to keep you in the stated accommodation, subject to the itinerary and official arrangements. Always check the schedule listed for each package.", "শিফটিং ও নন-শিফটিং হজ্জের পার্থক্য কী?", "শিফটিং প্যাকেজে হজ্জের সময় থাকার জায়গা পরিকল্পিতভাবে বদলানো হয়। নন-শিফটিং প্যাকেজে নির্ধারিত জায়গাতেই থাকার ব্যবস্থা রাখা হয়, তবে তা সফরসূচি ও সরকারি ব্যবস্থার ওপর নির্ভর করে। প্রতিটি প্যাকেজের সময়সূচি ভালো করে দেখে নিন।"],
  ["Are package prices final?", "No. Starting prices are estimates and can change with flights, hotel availability, occupancy and exchange rates. We provide a written confirmed quotation before any payment.", "প্যাকেজের দাম কি চূড়ান্ত?", "না। শুরুর দাম আনুমানিক। ফ্লাইট, হোটেলের সিট, রুমে থাকার সংখ্যা ও ডলারের দামের কারণে দাম বদলাতে পারে। টাকা দেওয়ার আগে আমরা লিখিত নিশ্চিত কোটেশন দিই।"],
  ["What does '300 metres from the Haram' mean?", "It is the stated distance from the hotel to the relevant point at the Masjid. We label whether it is a walking-route or straight-line figure. Actual walking time varies.", "“হারাম থেকে ৩০০ মিটার” মানে কী?", "এর মানে হোটেল থেকে মসজিদের নির্দিষ্ট স্থান পর্যন্ত দূরত্ব। এটি হাঁটার পথের দূরত্ব নাকি সোজা দূরত্ব, তা আমরা লিখে জানাই। হাঁটতে কতক্ষণ লাগবে তা মানুষভেদে আলাদা হয়।"],
  ["How do I know you are licensed?", "Our licence details are on this page and linked to the official government directory so you can verify them yourself.", "আপনারা লাইসেন্সপ্রাপ্ত, তা বুঝব কীভাবে?", "আমাদের লাইসেন্সের তথ্য এই পাতায় আছে এবং সরকারি তালিকার সাথে যুক্ত, যাতে আপনি নিজেই যাচাই করতে পারেন।"],
];

const JOURNEYS = [
  ["umrah", "Umrah", "Customize your own trip and see the cost change as you choose.", [["Group Umrah dates", "#/group-umrah"], ["Estimate my Umrah", "#/estimate"]]],
  ["hajj", "Hajj", "Compare shifting and non-shifting packages, or let the finder pick the closest match.", [["Find my Hajj", "#/find-your-hajj"], ["All packages", "#/packages"]]],
];
const JOURNEY_IMG = {
  umrah: ["hero-5", "Pilgrims in white ihram walking beside the Kaaba", "50% 60%"],
  hajj: ["hero-3", "Crowds of pilgrims around the Kaaba with the Makkah clock tower behind", "50% 70%"],
};
const TRUST = [
  [BadgeCheck, "Verified licence", "Licence details linked to the official government directory."],
  [Users, "Shariah board", "Profiles of our scholars and the guidance they provide."],
  [BookOpen, "Past trips archive", "Every completed departure stays on record."],
  [Star, "Genuine reviews", "Moderated reviews from real pilgrims only."],
];

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
      <main className="home-large bg-pattern pb-24 md:pb-0">
        <Hero />

        <Section>
          <SectionTitle eyebrow="Choose your journey">Umrah or Hajj</SectionTitle>
          <div className="grid gap-5 md:grid-cols-2">
            {JOURNEYS.map(([id, t, d, a]) => (
              <article key={id} id={id} className="group overflow-hidden rounded-3xl border border-mid/30 bg-white shadow-md transition-shadow hover:shadow-xl">
                <div className="relative h-60 overflow-hidden md:h-72">
                  <img
                    src={`/media/${JOURNEY_IMG[id][0]}-900.webp`}
                    srcSet={`/media/${JOURNEY_IMG[id][0]}-900.webp 900w, /media/${JOURNEY_IMG[id][0]}-1600.webp 1600w`}
                    sizes="(min-width: 768px) 45vw, 100vw"
                    alt={JOURNEY_IMG[id][1]}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: JOURNEY_IMG[id][2] }}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/20 to-transparent" aria-hidden="true" />
                  <h3 className="absolute bottom-4 left-6 text-4xl font-bold text-white drop-shadow md:bottom-5 md:left-8 md:text-5xl">{t}</h3>
                </div>
                <div className="p-6 md:p-8">
                  <p className="muted">{d}</p>
                  <div className="mt-6 flex flex-wrap gap-3">{a.map(([x, h]) => <LinkButton key={x} href={h} variant="navy" small>{x}</LinkButton>)}</div>
                </div>
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

        <EasySteps />

        <QuickHelp />

        <HotelGuide />

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
        <ReviewsShowcase reviews={reviews} />

        <FaqCards items={FAQ} />

        <Footer className="mt-0" />
        <HelpDock />
      </main>
    </LazyMotion>
  );
}
