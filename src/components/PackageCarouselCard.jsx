import { CarouselCard } from "@/components/ui/carousel-cards";
import { taka, TYPE_LABEL, PERIOD_LABEL } from "@/lib/utils";

// Every package shows the same fields in the same places, so all cards are one size.
// The photos are the site's own hero pictures, reused in turn (no per-package photos exist yet).
const PHOTOS = [1, 2, 3, 4, 5].map((n) => `/media/hero-${n}-900.webp`);

export function PackageCarouselCard({ p, index = 0 }) {
  const parts = [];
  if (p.makkah.max != null) parts.push(`Makkah ${p.makkah.min}–${p.makkah.max} m`);
  else parts.push("Straight to Aziziyah");
  if (p.madinah.max != null) parts.push(`Madinah ${p.madinah.min}–${p.madinah.max} m`);
  return (
    <CarouselCard
      href={`#/packages/${p.slug}`}
      image={PHOTOS[index % PHOTOS.length]}
      badge={`${TYPE_LABEL[p.type]} · ${PERIOD_LABEL[p.period]}`}
      title={p.title}
      location={parts.join(" · ")}
      detail={p.flight}
      footerLeft={`${p.days} days`}
      footerRight={`From ${taka(p.from)}`}
    />
  );
}
