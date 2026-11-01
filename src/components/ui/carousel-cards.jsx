import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Adapted from the "Carousel Cards" block (kokonutui). Next.js parts (next/image, next/link) became plain <img> and <a>.
// Removed from the original: the favourite heart and the star rating, because this site has no favourites or ratings to show.

/** One card. Every card has the same fixed size, whatever the text. */
export function CarouselCard({ title, image, imageAlt = "", placeholder, badge, location, detail, footerLeft, footerRight, href, action }) {
  const body = (
    <Card className="group relative flex h-[340px] w-full flex-col overflow-hidden rounded-xl border border-mid/20 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-t-xl bg-gradient-to-br from-sky to-white">
        {image
          ? <img src={image} alt={imageAlt} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          : <div aria-hidden="true" className="flex h-full w-full items-center justify-center text-mid/60">{placeholder}</div>}
        {badge && <Badge className="absolute left-2 top-2 rounded-md border-0 bg-white/90 px-1.5 py-0.5 text-xs font-medium text-navy-deep">{badge}</Badge>}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <CardContent className="space-y-0.5 p-3 pb-0">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-navy-deep">{title}</h3>
          {location && <p className="line-clamp-1 text-xs text-navy-deep/70" title={location}>{location}</p>}
          {detail && <p className="line-clamp-1 text-xs text-navy-deep/70" title={detail}>{detail}</p>}
        </CardContent>
        <CardFooter className="mt-auto gap-1 p-3 pt-0 text-xs text-navy-deep">
          <span className="flex items-center gap-1">{footerLeft}</span>
          <span className="ml-auto font-semibold tracking-tight text-navy">{footerRight}</span>
        </CardFooter>
      </div>
    </Card>
  );
  return href
    ? <a href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{body}</a>
    : body;
}

/** A titled row of cards with arrow buttons and swipe/scroll. `children` are the cards. */
export function CarouselSection({ title, subtitle, showAllHref, showAllLabel = "Show all", children, className }) {
  const box = React.useRef(null);
  const by = (dx) => box.current?.scrollBy({ left: dx, behavior: "smooth" });
  return (
    <div className={`w-full py-4 ${className || ""}`}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-2xl">{title}</h2>
          {subtitle && <p className="muted mt-0.5 text-sm">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="round-btn" onClick={() => by(-280)}><ChevronLeft className="h-4 w-4" /><span className="sr-only">Scroll left</span></button>
          <button type="button" className="round-btn" onClick={() => by(280)}><ChevronRight className="h-4 w-4" /><span className="sr-only">Scroll right</span></button>
          {showAllHref && <a href={showAllHref} className="link ml-2 hidden text-xs font-medium md:block">{showAllLabel}</a>}
        </div>
      </div>
      <div ref={box} className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3">
        {React.Children.map(children, (c) => <div className="w-[240px] flex-none snap-start md:w-[260px]">{c}</div>)}
      </div>
    </div>
  );
}
