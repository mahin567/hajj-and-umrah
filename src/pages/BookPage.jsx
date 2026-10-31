import { useMemo, useRef, useState } from "react";
import { CalendarDays, Check, Clock, MessageCircle, Minus, Plus, ShieldCheck } from "lucide-react";
import { PageTitle } from "@/Layout";
import { request } from "@/lib/api";
import { hashQuery } from "@/lib/hooks";
import { waLink } from "@/lib/utils";
import { BOOKING_DAYS_AHEAD, BOOKING_SLOTS, CONSULTATION_TYPES, WHATSAPP } from "@/config";

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (n) => new Date(Date.now() + n * 864e5);
const COOLDOWN_MS = 30_000;
const KEY = "otw_last_booking";

// Same rules for every field, so the messages are consistent.
const clean = (s) => s.replace(/\s+/g, " ").trim();
const phoneOk = (v) => /^\+?\d{10,15}$/.test(v.replace(/[\s-]/g, ""));
function validate(f, min, max) {
  const e = {};
  const name = clean(f.name);
  if (name.length < 2) e.name = "Please enter your full name.";
  else if (name.length > 80) e.name = "Name is too long (80 characters max).";
  if (!phoneOk(f.phone)) e.phone = "Enter a phone number with 10 to 15 digits, for example 01712345678.";
  if (!f.date) e.date = "Choose a date.";
  else if (f.date < min || f.date > max) e.date = "Choose a date from tomorrow up to 90 days ahead.";
  if (!f.time) e.time = "Choose a time.";
  if (!(f.travellers >= 1 && f.travellers <= 50)) e.travellers = "Travellers must be between 1 and 50.";
  if (f.message.length > 500) e.message = "Message is too long (500 characters max).";
  return e;
}

const Field = ({ id, label, error, hint, children }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">{label}</label>
    {children}
    {hint && !error && <p id={`${id}-d`} className="mt-1 text-xs text-navy-deep/60">{hint}</p>}
    {error && <p id={`${id}-d`} role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
  </div>
);
const inp = (bad) => `w-full rounded-xl border bg-white px-4 py-3 text-sm text-navy-deep placeholder-navy-deep/40 focus:outline-none focus:ring-2 focus:ring-mid/40 ${bad ? "border-red-500" : "border-mid/40 focus:border-mid"}`;

export default function BookPage() {
  const q = useMemo(hashQuery, []);
  const min = ymd(addDays(1)), max = ymd(addDays(BOOKING_DAYS_AHEAD));
  const [f, setF] = useState({
    name: "", phone: "", kind: q.kind === "hajj" ? "hajj" : "umrah", type: CONSULTATION_TYPES[0][1],
    date: "", time: "", travellers: 1, message: (q.about || "").slice(0, 200), website: "", // "website" is a hidden trap field for bots
  });
  const [err, setErr] = useState({});
  const [st, setSt] = useState("idle"); // idle | sending | done | error | limited | wait
  const [apiErr, setApiErr] = useState("");
  const [sent, setSent] = useState(null);
  const formRef = useRef(null);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const step = (n) => setF((p) => ({ ...p, travellers: Math.min(50, Math.max(1, Number(p.travellers || 1) + n)) }));

  const submit = async (e) => {
    e.preventDefault();
    if (st === "sending") return;
    const v = validate({ ...f, travellers: Number(f.travellers) }, min, max);
    setErr(v);
    if (Object.keys(v).length) {
      formRef.current?.querySelector(`[name="${Object.keys(v)[0]}"]`)?.focus();
      return;
    }
    if (f.website) { setSent({ ...f }); setSt("done"); return; } // a bot filled the hidden field: pretend success, send nothing
    try {
      const last = Number(sessionStorage.getItem(KEY) || 0);
      if (Date.now() - last < COOLDOWN_MS) { setSt("wait"); return; }
    } catch { /* storage may be blocked */ }
    setSt("sending");
    setApiErr("");
    try {
      const r = await request("/appointments/", { method: "POST", body: {
        name: clean(f.name), phone: f.phone.replace(/[\s-]/g, ""), kind: f.kind, consultation_type: f.type,
        preferred_at: `${f.date}T${f.time}:00+06:00`, // Bangladesh time
        travellers: Number(f.travellers), message: f.message.trim(),
      } });
      if (r.ok) {
        try { sessionStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ }
        setSent({ ...f }); setSt("done");
      } else if (r.status === 429) setSt("limited");
      else {
        if (r.status === 400 && r.data && typeof r.data === "object") {
          const first = Object.values(r.data).flat()[0];
          if (typeof first === "string") setApiErr(first.slice(0, 200));
        }
        setSt("error");
      }
    } catch { setSt("error"); }
  };

  if (st === "done" && sent) {
    const when = new Date(`${sent.date}T${sent.time}:00`).toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
    return (
      <>
        <PageTitle eyebrow="Appointment" title="Request received" />
        <section className="mx-auto max-w-xl px-4 py-10">
          <div role="status" className="rounded-2xl border border-mid/30 bg-white p-6 text-center md:p-8">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky text-mid"><Check size={28} /></span>
            <h2 className="mt-4 font-display text-2xl text-navy">Thank you, {clean(sent.name).split(" ")[0]}</h2>
            <p className="mt-2 text-navy-deep/75">We received your request for <b>{when}</b> ({sent.type}). Our team will call or message you on <b>{sent.phone}</b> to confirm. It is not confirmed until you hear from us.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a href={waLink(WHATSAPP, `Assalamu alaikum, I requested an appointment for ${sent.date} at ${sent.time} (${sent.type}).`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-navy-deep hover:bg-accent-light"><MessageCircle size={16} />Message us on WhatsApp</a>
              <a href="#/packages" className="rounded-full border border-navy px-6 py-3 text-center text-sm text-navy hover:bg-sky">Browse packages meanwhile</a>
            </div>
          </div>
        </section>
      </>
    );
  }

  const invalid = (k) => (err[k] ? { "aria-invalid": true, "aria-describedby": `${k}-d` } : {});
  return (
    <>
      <PageTitle eyebrow="Free consultation" title="Book an appointment">Tell us when suits you. An advisor will confirm by phone or WhatsApp. No payment is taken on this page.</PageTitle>
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1fr_300px]">
        <form ref={formRef} onSubmit={submit} noValidate className="space-y-5 rounded-2xl border border-mid/30 bg-white p-5 md:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="name" label="Full name" error={err.name}>
              <input id="name" name="name" autoComplete="name" maxLength={80} value={f.name} onChange={set("name")} placeholder="Your name" className={inp(err.name)} {...invalid("name")} />
            </Field>
            <Field id="phone" label="Phone / WhatsApp" error={err.phone}>
              <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} value={f.phone} onChange={set("phone")} placeholder="01712 345678" className={inp(err.phone)} {...invalid("phone")} />
            </Field>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-navy">I am interested in</legend>
            <div className="flex gap-2" role="radiogroup">
              {[["umrah", "Umrah"], ["hajj", "Hajj"]].map(([v, l]) => (
                <button type="button" key={v} role="radio" aria-checked={f.kind === v} onClick={() => setF((p) => ({ ...p, kind: v }))}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm transition ${f.kind === v ? "border-navy bg-navy text-white" : "border-mid/40 bg-white text-navy hover:border-navy"}`}>{l}</button>
              ))}
            </div>
          </fieldset>

          <Field id="type" label="How would you like to talk?">
            <select id="type" name="type" value={f.type} onChange={set("type")} className={inp(false)}>
              {CONSULTATION_TYPES.map(([v, l]) => <option key={v} value={l}>{l}</option>)}
            </select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="date" label="Preferred date" error={err.date}>
              <input id="date" name="date" type="date" min={min} max={max} value={f.date} onChange={set("date")} className={inp(err.date)} {...invalid("date")} />
            </Field>
            <Field id="time" label="Preferred time" error={err.time} hint="Bangladesh time">
              <select id="time" name="time" value={f.time} onChange={set("time")} className={inp(err.time)} {...invalid("time")}>
                <option value="">Choose a time</option>
                {BOOKING_SLOTS.map((t) => <option key={t} value={t}>{new Date(`2000-01-01T${t}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</option>)}
              </select>
            </Field>
          </div>

          <Field id="travellers" label="Number of travellers" error={err.travellers}>
            <div className="flex w-fit items-center gap-2">
              <button type="button" aria-label="Fewer travellers" onClick={() => step(-1)} className="rounded-full border border-mid/40 p-2.5 text-navy hover:bg-sky"><Minus size={16} /></button>
              <input id="travellers" name="travellers" type="number" inputMode="numeric" min={1} max={50} value={f.travellers} onChange={set("travellers")} className={`${inp(err.travellers)} w-20 text-center`} {...invalid("travellers")} />
              <button type="button" aria-label="More travellers" onClick={() => step(1)} className="rounded-full border border-mid/40 p-2.5 text-navy hover:bg-sky"><Plus size={16} /></button>
            </div>
          </Field>

          <Field id="message" label="Anything we should know? (optional)" error={err.message} hint={`${f.message.length}/500`}>
            <textarea id="message" name="message" rows={3} maxLength={500} value={f.message} onChange={set("message")} placeholder="Preferred dates, hotel distance, budget, elderly or wheelchair needs" className={inp(err.message)} {...invalid("message")} />
          </Field>

          {/* Bot trap: hidden from people and screen readers */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>Website<input tabIndex={-1} autoComplete="off" name="website" value={f.website} onChange={set("website")} /></label>
          </div>

          <button disabled={st === "sending"} className="w-full rounded-full bg-accent py-3.5 text-sm font-medium text-navy-deep transition hover:bg-accent-light disabled:opacity-60">
            {st === "sending" ? "Sending…" : "Request appointment"}
          </button>
          <div aria-live="polite">
            {st === "error" && <p role="alert" className="text-center text-sm text-red-700">{apiErr || "We could not send your request. Please try again, or use WhatsApp."}</p>}
            {st === "limited" && <p role="alert" className="text-center text-sm text-red-700">Too many requests from this connection. Please try again later or message us on WhatsApp.</p>}
            {st === "wait" && <p role="alert" className="text-center text-sm text-red-700">You just sent a request. Please wait a few seconds before sending another.</p>}
          </div>
        </form>

        <aside className="space-y-4 text-sm text-navy-deep/80">
          <div className="rounded-2xl border border-mid/30 bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-lg text-navy"><CalendarDays size={18} className="text-mid" />What happens next</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5"><li>You send this form.</li><li>An advisor contacts you to confirm the time.</li><li>We talk through your plans. You get a written quotation before any payment.</li></ol>
          </div>
          <div className="rounded-2xl border border-mid/30 bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-lg text-navy"><ShieldCheck size={18} className="text-mid" />Your details</h2>
            <p className="mt-2">We use your name and number only to contact you about this request. Please do not share passport or card numbers here.</p>
          </div>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-navy px-5 py-3 text-navy hover:bg-sky"><Clock size={16} />Need a faster answer? WhatsApp</a>
        </aside>
      </section>
    </>
  );
}
