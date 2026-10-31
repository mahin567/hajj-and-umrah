import { lazy, Suspense, useEffect, useState } from "react";
import HomePage from "@/HomePage";
import { Header, Footer } from "@/Layout";

// Each page is its own chunk, so the home page loads fast and other pages download only when opened.
const PackagesPage = lazy(() => import("@/pages/PackagesPage"));
const PackageDetail = lazy(() => import("@/pages/PackageDetail"));
const FinderPage = lazy(() => import("@/pages/FinderPage"));
const EstimatorPage = lazy(() => import("@/pages/EstimatorPage"));
const ZonesPage = lazy(() => import("@/pages/ZonesPage"));
const BookPage = lazy(() => import("@/pages/BookPage"));
const TrustPage = lazy(() => import("@/pages/TrustPage"));
const GroupUmrahPage = lazy(() => import("@/pages/GroupUmrahPage"));
const HotelsPage = lazy(() => import("@/pages/HotelsPage"));

const TITLES = {
  packages: "Hajj packages 2027", "group-umrah": "Group Umrah departures", "find-your-hajj": "Find your Hajj",
  estimate: "Umrah cost estimate", zones: "Distance & zones", hotels: "Hotel directory", trust: "Trust Centre", book: "Book an appointment",
};
const SITE = "Own The World – Hajj & Umrah";

// Hash routes (#/packages). Plain anchors like #faq are not routes, so the home page keeps its in-page links.
const route = () => (location.hash.startsWith("#/") ? location.hash.slice(2).split("?")[0] : "");

const Loading = () => <div role="status" className="mx-auto max-w-7xl px-4 py-24 text-center text-navy-deep/60">Loading…</div>;

export default function App() {
  const [path, setPath] = useState(route());
  useEffect(() => {
    const on = () => {
      setPath(route());
      if (location.hash.startsWith("#/")) window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const [page, arg] = path.split("/");
  useEffect(() => {
    document.title = TITLES[page] ? `${TITLES[page]} | ${SITE}` : SITE;
    // move keyboard focus to the new page heading (screen readers announce the change)
    if (TITLES[page]) requestAnimationFrame(() => document.getElementById("page-title")?.focus({ preventScroll: true }));
  }, [page, arg]);

  let view = null;
  if (page === "packages") view = arg ? <PackageDetail slug={arg} /> : <PackagesPage />;
  else if (page === "find-your-hajj") view = <FinderPage />;
  else if (page === "estimate") view = <EstimatorPage />;
  else if (page === "zones") view = <ZonesPage />;
  else if (page === "book") view = <BookPage />;
  else if (page === "trust") view = <TrustPage />;
  else if (page === "group-umrah") view = <GroupUmrahPage />;
  else if (page === "hotels") view = <HotelsPage />;
  if (!view) return <HomePage />;
  return (
    <div className="min-h-screen bg-cream font-sans text-navy-deep">
      <Header />
      <main><Suspense fallback={<Loading />}>{view}</Suspense></main>
      <Footer />
    </div>
  );
}
