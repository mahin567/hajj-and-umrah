import * as React from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Adapted from the "Carousel Cards" block (kokonutui). Next.js parts (next/image, next/link) became plain <img> and <a>.
// Removed from the original: the favourite heart and the star rating, because this site has no favourites or ratings to show.

/** One card. Every card has the same fixed size, whatever the text. */
export function CarouselCard({ title, image, imageAlt = "", placeholder, badge, location, detail, footerLeft, footerRight, href, action, titleHref, imageHref, tall }) {
  const body = (
    <Card className={`group relative flex ${action || tall ? "h-[392px]" : "h-[340px]"} w-full min-w-0 flex-col overflow-hidden rounded-xl border border-mid/20 shadow-sm transition-shadow duration-300 hover:shadow-md`}>
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-t-xl bg-gradient-to-br from-sky to-white">
        {(() => {
          const pic = image
            ? <img src={image} alt={imageAlt} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            : <div aria-hidden="true" className="flex h-full w-full items-center justify-center text-mid/60">{placeholder}</div>;
          return imageHref ? <a href={imageHref} target="_blank" rel="noopener noreferrer" aria-label={`${imageAlt} (opens the hotel website)`} tabIndex={-1} className="block h-full w-full">{pic}</a> : pic;
        })()}
        {badge && <Badge className="absolute left-2 top-2 rounded-md border-0 bg-white/90 px-1.5 py-0.5 text-xs font-medium text-navy-deep">{badge}</Badge>}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <CardContent className="space-y-0.5 p-3 pb-0">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-navy-deep">{titleHref ? <a href={titleHref} target="_blank" rel="noopener noreferrer" className="link">{title}<ExternalLink size={12} aria-hidden="true" className="ml-1 inline align-baseline" /><span className="sr-only"> (opens the hotel website)</span></a> : title}</h3>
          {location && <p className="line-clamp-1 text-xs text-navy-deep/70" title={location}>{location}</p>}
          {detail && <div className="pt-1 text-xs text-navy-deep/70">{detail}</div>}
        </CardContent>
        <CardFooter className="mt-auto gap-1 p-3 pt-0 text-xs text-navy-deep">
          <span className="flex items-center gap-1">{footerLeft}</span>
          <span className="ml-auto font-semibold tracking-tight text-navy">{footerRight}</span>
        </CardFooter>
        {action && <div className="px-3 pb-3">{action}</div>}
      </div>
    </Card>
  );
  return href
    ? <a href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{body}</a>
    : body;
}

/** A titled row of cards with arrow buttons and swipe/scroll. `children` are the cards. */
export function CarouselSection({ title, subtitle, showAllHref, showAllLabel = "Show all", children, className, grid }) {
  const box = React.useRef(null);
  const by = (dx) => box.current?.scrollBy({ left: dx, behavior: "smooth" });
  return (
    <div className={`relative w-full min-w-0 max-w-full overflow-x-clip py-4 ${className || ""}`}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-2xl">{title}</h2>
          {subtitle && <p className="muted mt-0.5 text-sm">{subtitle}</p>}
        </div>
        <div className={`flex items-center gap-1 ${grid ? "md:hidden" : ""}`}>
          <button type="button" className="round-btn" onClick={() => by(-280)}><ChevronLeft className="h-4 w-4" /><span className="sr-only">Scroll left</span></button>
          <button type="button" className="round-btn" onClick={() => by(280)}><ChevronRight className="h-4 w-4" /><span className="sr-only">Scroll right</span></button>
          {showAllHref && <a href={showAllHref} className="link ml-2 hidden text-xs font-medium md:block">{showAllLabel}</a>}
        </div>
      </div>
      <div ref={box} className={`scrollbar-hide -mx-1 flex w-auto max-w-[calc(100%+0.5rem)] snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-1 pb-3 ${grid ? "md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-3 xl:grid-cols-4" : ""}`}>
        {React.Children.map(children, (c) => <div className={grid ? "w-[78vw] max-w-[300px] flex-none snap-start md:w-auto md:max-w-none" : "w-[240px] flex-none snap-start md:w-[260px]"}>{c}</div>)}
      </div>
    </div>
  );
}
