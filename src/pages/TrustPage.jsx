import { BadgeCheck, ExternalLink, FileText, MapPin, MessageCircle, ScrollText, ShieldCheck, Star, Users } from "lucide-react";
import { PageTitle, Empty } from "@/Layout";
import { Testimonials } from "@/components/ui/testimonials";
import { useGet } from "@/lib/hooks";
import { safeHttps } from "@/lib/utils";
import { Chip, LinkButton } from "@/components/ui/kit";
import { ADDRESS, LICENCE, MAP_LINK, PHONE, PHONE_DISPLAY, WHATSAPP } from "@/config";
import { BOARD, POLICIES, STORIES, TEAM } from "@/content/trust";

const Section = ({ id, icon: I, title, children }) => (
  <section id={id} aria-labelledby={`${id}-h`} className="mt-12 first:mt-0">
    <h2 id={`${id}-h`} className="mb-5 flex items-center gap-3 text-2xl md:text-3xl"><I className="text-mid" size={26} />{title}</h2>
    {children}
  </section>
);

function Licence() {
  const verify = safeHttps(LICENCE.verifyUrl);
  const rows = [["Licence number", LICENCE.number], ["Issued by", LICENCE.authority], ["Valid until", LICENCE.validUntil]].filter(([, v]) => v);
  if (!rows.length && !verify) return <Empty>Our licence details are being added to this page. Until then, please ask us for a copy and check it with the issuing authority before you pay.</Empty>;
  return (
    <div className="panel">
      <dl className="grid gap-4 sm:grid-cols-3">
        {rows.map(([k, v]) => <div key={k}><dt className="label">{k}</dt><dd className="mt-1 font-display text-xl font-semibold text-navy">{v}</dd></div>)}
      </dl>
      {verify && <LinkButton href={verify} target="_blank" rel="noopener noreferrer" variant="navy" small className="mt-5">Verify on the official directory <ExternalLink size={14} /></LinkButton>}
    </div>
  );
}

const Person = ({ p }) => (
  <article className="panel">
    <div className="flex items-center gap-3">
      {p.photo ? <img src={p.photo} alt="" loading="lazy" decoding="async" width="56" height="56" className="h-14 w-14 rounded-full object-cover" />
        : <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-sky font-display text-lg text-navy">{p.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>}
      <div><h3 className="text-lg leading-tight">{p.name}</h3>{p.role && <p className="muted text-sm">{p.role}</p>}</div>
    </div>
    {p.bio && <p className="muted mt-3 text-sm">{p.bio}</p>}
  </article>
);

const People = ({ list, empty }) => (list.length
  ? <div className="grid-cards">{list.map((p) => <Person key={p.name} p={p} />)}</div>
  : <Empty>{empty}</Empty>);

export default function TrustPage() {
  const { data } = useGet("/reviews/");
  const stories = [
    ...STORIES.map((s) => ({ name: s.name, username: s.role, image: s.photo, text: s.text })),
    ...(Array.isArray(data) ? data : []).map((r) => ({ name: r.name, username: "★".repeat(Math.min(5, Math.max(1, r.rating || 5))), text: r.text })),
  ];
  return (
    <>
      <PageTitle eyebrow="Trust Centre" title="Know who you are paying">Everything you should check before you book: our licence, our written policies, the people who guide you, and what past pilgrims say.</PageTitle>
      <div className="wrap-md page-body">
        <nav aria-label="On this page" className="mb-10 flex flex-wrap gap-2">
          {[["licence", "Licence"], ["policies", "Policies"], ["board", "Shariah board"], ["team", "Team"], ["stories", "Success stories"], ["visit", "Visit us"]].map(([id, l]) => (
            <Chip key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}>{l}</Chip>
          ))}
        </nav>

        <Section id="licence" icon={BadgeCheck} title="Licence & registration"><Licence /></Section>

        <Section id="policies" icon={ScrollText} title="Our policies">
          <div className="space-y-3">
            {POLICIES.map((p) => (
              <details key={p.id} className="group panel !p-5">
                <summary className="flex items-center justify-between gap-3 font-medium text-navy">{p.title}<span aria-hidden="true" className="text-mid transition-transform group-open:rotate-45">+</span></summary>
                <div className="muted mt-3 space-y-2 text-sm">
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
            ? <Testimonials title="" testimonials={stories} className="-mt-4" />
            : <Empty>Reviews and stories are published only after moderation and the pilgrim’s consent. None have been published yet.</Empty>}
        </Section>

        <Section id="visit" icon={MapPin} title="Visit or contact us">
          <div className="panel grid gap-4 sm:grid-cols-2">
            <div><p className="label">Office</p><p className="mt-1 text-navy-deep">{ADDRESS}</p>
              <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className="link mt-3 inline-flex items-center gap-1 text-sm">Open in Google Maps <ExternalLink size={13} /></a></div>
            <div className="space-y-3 text-sm">
              <a href={PHONE} className="link block">{PHONE_DISPLAY}</a>
              <div className="flex flex-wrap gap-2">
                <LinkButton href={WHATSAPP} target="_blank" rel="noopener noreferrer" small><MessageCircle size={16} />WhatsApp</LinkButton>
                <LinkButton href="#/book" variant="outline" small><FileText size={16} />Book appointment</LinkButton>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
