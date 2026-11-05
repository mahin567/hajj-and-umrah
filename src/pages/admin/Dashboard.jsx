import { CalendarCheck, MessageSquare, Package, Star } from "lucide-react";
import { useList } from "@/lib/adminApi";
import { Card, Empty, Pill, fmtDate } from "./ui";

const TILES = [
  ["new_enquiries", "New enquiries", "enquiries", MessageSquare, "bg-navy text-accent-light"],
  ["pending_appointments", "Appointments to confirm", "appointments", CalendarCheck, "bg-accent text-navy-deep"],
  ["reviews_waiting", "Reviews to approve", "reviews", Star, "bg-gold text-navy-deep"],
  ["open_packages", "Open packages", "packages", Package, "bg-emerald-600 text-white"],
];

export default function Dashboard({ stats, username }) {
  const enquiries = useList("enquiries");
  const appts = useList("appointments");
  const upcoming = (appts.items || []).filter((a) => new Date(a.preferred_at) >= new Date() && !["cancelled", "no_show"].includes(a.status)).slice(0, 5);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TILES.map(([key, label, to, Icon, tone]) => (
          <a key={key} href={`#/admin/${to}`} className="group rounded-3xl border border-mid/25 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon size={24} aria-hidden="true" /></span>
            <p className="mt-4 font-display text-4xl font-semibold text-navy">{stats ? stats[key] : "–"}</p>
            <p className="muted text-sm">{label}</p>
          </a>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl">Latest enquiries</h2><a className="link text-sm" href="#/admin/enquiries">See all</a></div>
          {!enquiries.items ? <p className="faint">Loading…</p> : enquiries.items.length === 0 ? <Empty>No enquiries yet.</Empty> : (
            <ul className="divide-y divide-mid/15">
              {enquiries.items.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="truncate font-medium text-navy-deep">{e.name}</p><p className="faint">{e.phone} · {fmtDate(e.created_at)}</p></div>
                  <Pill tone={e.status}>{e.status}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl">Upcoming appointments</h2><a className="link text-sm" href="#/admin/appointments">See all</a></div>
          {!appts.items ? <p className="faint">Loading…</p> : upcoming.length === 0 ? <Empty>Nothing booked ahead.</Empty> : (
            <ul className="divide-y divide-mid/15">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="truncate font-medium text-navy-deep">{a.name}</p><p className="faint">{fmtDate(a.preferred_at)} · {a.travellers} traveller{a.travellers > 1 ? "s" : ""}</p></div>
                  <Pill tone={a.status}>{a.status.replace("_", " ")}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <p className="faint">Signed in as {username}. Changes here show on the website straight away.</p>
    </div>
  );
}
