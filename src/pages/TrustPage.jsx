import { BadgeCheck, ExternalLink, FileText, MapPin, MessageCircle, ScrollText, ShieldCheck, Star, Users } from "lucide-react";
import { PageTitle, Empty } from "@/Layout";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { useGet } from "@/lib/hooks";
import { safeHttps } from "@/lib/utils";
import { ADDRESS, LICENCE, MAP_LINK, PHONE, PHONE_DISPLAY, WHATSAPP } from "@/config";
import { BOARD, POLICIES, STORIES, TEAM } from "@/content/trust";

const Section = ({ id, icon: I, title, children }) => (
  <section id={id} aria-labelledby={`${id}-h`} className="mt-12 first:mt-0">
    <h2 id={`${id}-h`} className="mb-5 flex items-center gap-3 font-display text-2xl text-navy md:text-3xl"><I className="text-mid" size={26} />{title}</h2>
    {children}
  </section>
);

function Licence() {
  const verify = safeHttps(LICENCE.verifyUrl);
  const rows = [["Licence number", LICENCE.number], ["Issued by", LICENCE.authority], ["Valid until", LICENCE.validUntil]].filter(([, v]) => v);
  if (!rows.length && !verify) return <Empty>Our licence details are being added to this page. Until then, please ask us for a copy and check it with the issuing authority before you pay.</Empty>;
  return (
    <div className="rounded-2xl border border-mid/30 bg-white p-6">
      <dl className="grid gap-4 sm:grid-cols-3">
        {rows.map(([k, v]) => <div key={k}><dt className="text-xs uppercase tracking-wider text-navy-deep/60">{k}</dt><dd className="mt-1 font-display text-xl text-navy">{v}</dd></div>)}
      </dl>
      {verify && <a href={verify} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm text-white hover:bg-navy-deep">Verify on the official directory <ExternalLink size={14} /></a>}
    </div>
  );
}

const Person = ({ p }) => (
  <article className="rounded-2xl border border-mid/30 bg-white p-5">
    <div className="flex items-center gap-3">
      {p.photo ? <img src={p.photo} alt="" loading="lazy" decoding="async" width="56" height="56" className="h-14 w-14 rounded-full object-cover" />
        : <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-sky font-display text-lg text-navy">{p.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>}
      <div><h3 className="font-display text-lg leading-tight text-navy">{p.name}</h3>{p.role && <p className="text-sm text-navy-deep/65">{p.role}</p>}</div>
    </div>
    {p.bio && <p className="mt-3 text-sm text-navy-deep/75">{p.bio}</p>}
  </article>
);

const People = ({ list, empty }) => (list.length
  ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((p) => <Person key={p.name} p={p} />)}</div>
  : <Empty>{empty}</Empty>);

export default function TrustPage() {
  const { data } = useGet("/reviews/");
  const stories = [
    ...STORIES.map((s) => ({ author: { name: s.name }, text: s.text })),
    ...(Array.isArray(data) ? data : []).map((r) => ({ author: { name: r.name, handle: "★".repeat(Math.min(5, Math.max(1, r.rating || 5))) }, text: r.text })),
  ];
  return (
    <>
      <PageTitle eyebrow="Trust Centre" title="Know who you are paying">Everything you should check before you book: our licence, our written policies, the people who guide you, and what past pilgrims say.</PageTitle>
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-14">
        <nav aria-label="On this page" className="mb-10 flex flex-wrap gap-2 text-sm">
          {[["licence", "Licence"], ["policies", "Policies"], ["board", "Shariah board"], ["team", "Team"], ["stories", "Success stories"], ["visit", "Visit us"]].map(([id, l]) => (
            <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })} className="rounded-full border border-mid/40 bg-white px-4 py-1.5 text-navy hover:border-navy">{l}</button>
          ))}
        </nav>

        <Section id="licence" icon={BadgeCheck} title="Licence & registration"><Licence /></Section>

        <Section id="policies" icon={ScrollText} title="Our policies">
          <div className="space-y-3">
            {POLICIES.map((p) => (
              <details key={p.id} className="group rounded-xl border border-mid/30 bg-white p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-navy marker:content-none">{p.title}<span aria-hidden="true" className="text-mid transition-transform group-open:rotate-45">+</span></summary>
                <div className="mt-3 space-y-2 text-sm text-navy-deep/75">
                  {p.body.length ? p.body.map((t) => <p key={t}>{t}</p>) : <p>The full wording of this policy is being published here. Until then, please ask your advisor and get the terms in writing before you pay.</p>}
                </div>
              </details>
            ))}
          </div>
        </Section>

        <Section id="board" icon={ShieldCheck} title="Shariah board">
          <People list={BOARD} empty="Profiles of the scholars who guide our programmes will be published here." />
        </Section>

        <Section id="team" icon={Users} title="Our team">
          <People list={TEAM} empty="Our team profiles will be published here." />
        </Section>

        <Section id="stories" icon={Star} title="Success stories">
          {stories.length
            ? <div className="grid justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">{stories.map((s, i) => <TestimonialCard key={i} {...s} className="w-full max-w-none" />)}</div>
            : <Empty>Reviews and stories are published only after moderation and the pilgrim’s consent. None have been published yet.</Empty>}
        </Section>

        <Section id="visit" icon={MapPin} title="Visit or contact us">
          <div className="grid gap-4 rounded-2xl border border-mid/30 bg-white p-6 sm:grid-cols-2">
            <div><p className="text-xs uppercase tracking-wider text-navy-deep/60">Office</p><p className="mt-1 text-navy-deep">{ADDRESS}</p>
              <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-navy underline">Open in Google Maps <ExternalLink size={13} /></a></div>
            <div className="space-y-2 text-sm">
              <a href={PHONE} className="block text-navy underline">{PHONE_DISPLAY}</a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-medium text-navy-deep hover:bg-accent-light"><MessageCircle size={16} />WhatsApp</a>
              <a href="#/book" className="ml-2 inline-flex items-center gap-2 rounded-full border border-navy px-5 py-2.5 text-navy hover:bg-sky"><FileText size={16} />Book appointment</a>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
