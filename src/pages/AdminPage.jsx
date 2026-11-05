import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { CalendarCheck, LayoutDashboard, LogOut, MessageSquare, Package, Star } from "lucide-react";
import { adminFetch, getToken, setToken } from "@/lib/adminApi";
import { cn } from "@/lib/utils";
import { Spinner } from "./admin/ui";
import Dashboard from "./admin/Dashboard";

const Inbox = lazy(() => import("./admin/Inbox"));
const Reviews = lazy(() => import("./admin/Reviews"));
const Packages = lazy(() => import("./admin/Packages"));

const NAV = [
  ["", "Dashboard", LayoutDashboard, null],
  ["enquiries", "Enquiries", MessageSquare, "new_enquiries"],
  ["appointments", "Appointments", CalendarCheck, "pending_appointments"],
  ["reviews", "Reviews", Star, "reviews_waiting"],
  ["packages", "Packages", Package, null],
];
const SUB = {
  "": "A quick look at what needs your attention.", enquiries: "People who asked for a quotation. Reply, then update the status.",
  appointments: "Consultation bookings from the website.", reviews: "Approve a review to show it on the website.", packages: "Add, edit or hide Hajj and Umrah packages.",
};

function Login({ onDone }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await adminFetch("/login/", { method: "POST", body: { username: u, password: p } });
    setBusy(false);
    if (r.ok) { setToken(r.data.token); onDone(r.data.username); }
    else setErr(r.status === 429 ? "Too many attempts. Please wait a minute." : r.status === 0 ? "Cannot reach the server. Is Django running?" : "Wrong username or password.");
  }
  return (
    <div className="grid min-h-screen place-items-center bg-pattern p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="relative bg-gradient-to-br from-navy-deep to-navy px-8 py-8 text-white">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 92% 0%, rgba(27,176,232,.38), transparent 55%)" }} />
          <div className="relative"><img src="/logo.webp" alt="Own The World" className="h-12 w-auto" /><h1 className="mt-4 text-3xl !text-white">Admin sign in</h1><p className="mt-1 text-sm text-white/75">For the Own The World team only.</p></div>
        </div>
        <form onSubmit={submit} className="space-y-4 p-8">
          <label className="block text-sm font-medium text-navy">Username<input required autoFocus autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} className="field mt-1" /></label>
          <label className="block text-sm font-medium text-navy">Password<input required type="password" autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} className="field mt-1" /></label>
          {err && <p role="alert" className="err">{err}</p>}
          <button type="submit" disabled={busy} className="btn btn-navy btn-block">{busy ? "Signing in…" : "Sign in"}</button>
          <a href="#/" className="btn-text justify-center text-center">← Back to the website</a>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage({ section = "" }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(!!getToken());
  const [stats, setStats] = useState(null);

  useEffect(() => { // keep this page out of search engines
    const m = document.createElement("meta"); m.name = "robots"; m.content = "noindex,nofollow"; document.head.appendChild(m);
    document.title = "Admin | Own The World";
    return () => m.remove();
  }, []);
  useEffect(() => { // resume a session that is still valid in this tab
    if (!getToken()) return;
    adminFetch("/me/").then((r) => { if (r.ok) setUser(r.data.username); setChecking(false); });
  }, []);
  useEffect(() => { const out = () => setUser(null); window.addEventListener("admin-logout", out); return () => window.removeEventListener("admin-logout", out); }, []);

  const refresh = useCallback(() => adminFetch("/stats/").then((r) => r.ok && setStats(r.data)), []);
  useEffect(() => { if (user) refresh(); }, [user, section, refresh]);

  async function logout() { await adminFetch("/logout/", { method: "POST" }); setToken(null); setUser(null); }

  if (checking) return <div className="grid min-h-screen place-items-center bg-pattern"><p role="status" className="muted">Loading…</p></div>;
  if (!user) return <Login onDone={setUser} />;

  const current = NAV.find((n) => n[0] === section) || NAV[0];
  const body = { enquiries: <Inbox kind="enquiries" />, appointments: <Inbox kind="appointments" />, reviews: <Reviews />, packages: <Packages /> }[current[0]]
    || <Dashboard stats={stats} username={user} />;

  return (
    <div className="min-h-screen bg-pattern">
      <div className="mx-auto grid w-full max-w-[1500px] gap-5 p-3 sm:p-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="flex min-w-0 flex-col gap-3 rounded-3xl bg-gradient-to-b from-navy-deep to-navy p-4 text-white shadow-lg lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:gap-6 lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <a href="#/admin" aria-label="Admin home"><img src="/logo.webp" alt="Own The World" className="h-10 w-auto lg:h-12" /></a>
            <button type="button" onClick={logout} className="btn btn-ghost-light btn-sm !px-3 !py-1.5 lg:hidden"><LogOut size={15} aria-hidden="true" />Sign out</button>
          </div>
          <nav aria-label="Admin" className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1 lg:flex-col lg:overflow-visible">
            {NAV.map(([to, label, Icon, stat]) => {
              const active = current[0] === to; const n = stat && stats ? stats[stat] : 0;
              return (
                <a key={to} href={`#/admin${to ? `/${to}` : ""}`} aria-current={active ? "page" : undefined}
                  className={cn("flex shrink-0 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition", active ? "bg-white font-semibold text-navy-deep" : "text-white/80 hover:bg-white/10")}>
                  <Icon size={18} aria-hidden="true" />{label}
                  {n > 0 && <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-navy-deep" aria-label={`${n} waiting`}>{n}</span>}
                </a>
              );
            })}
          </nav>
          <div className="mt-auto hidden space-y-2 border-t border-white/15 pt-4 lg:block">
            <p className="truncate text-xs text-white/60">Signed in as <b className="text-white">{user}</b></p>
            <a href="#/" className="block text-sm text-white/80 hover:text-white">← View website</a>
            <button type="button" onClick={logout} className="btn btn-ghost-light btn-sm btn-block"><LogOut size={15} aria-hidden="true" />Sign out</button>
          </div>
        </aside>
        <main className="min-w-0 space-y-5 pb-8">
          <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-deep via-navy-deep to-navy px-6 py-7 text-white shadow-lg md:px-9">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 92% 0%, rgba(27,176,232,.38), transparent 55%)" }} />
            <div className="relative"><p className="eyebrow !text-accent-light">Admin panel</p><h1 className="mt-1 text-3xl !text-white md:text-4xl">{current[1]}</h1><p className="mt-1 text-white/75">{SUB[current[0]]}</p></div>
          </header>
          <Suspense fallback={<Spinner />}>{body}</Suspense>
        </main>
      </div>
    </div>
  );
}
