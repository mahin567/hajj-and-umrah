import { useState } from "react";
import { ExternalLink, Quote } from "lucide-react";
import { cn, safeHttps } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Adapted from the "Testimonials" block. Next.js <Image> became <Avatar>, which shows the initials when there is no photo.
// Changed from the original: the X/Twitter button only appears when a real https `social` link is given;
// otherwise a quote mark is shown. Nothing is invented: it shows only what the `testimonials` prop contains.
// testimonials: [{ image?, name, username?, text, social? }]
export function Testimonials({ testimonials, className, title = "Read what people are saying", description = "", maxDisplayed = 6, fadeFrom = "from-background" }) {
  const [showAll, setShowAll] = useState(false);
  const more = testimonials.length > maxDisplayed && !showAll;
  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center pt-5">
        <div className="mb-8 flex flex-col gap-5">
          {title && <h2 className="text-center text-3xl md:text-4xl">{title}</h2>}
          {description && <p className="mx-auto max-w-xl muted text-center">{description}</p>}
        </div>
      </div>

      <div className="relative">
        <div className={cn("flex flex-wrap items-stretch justify-center gap-5", more && "max-h-[720px] overflow-hidden")}>
          {testimonials.slice(0, showAll ? undefined : maxDisplayed).map((t, i) => {
            const social = safeHttps(t.social);
            const initials = t.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
            return (
              <Card key={i} className="relative h-auto w-80 max-w-full border-border bg-card p-5">
                <div className="flex items-center">
                  <Avatar className="h-[50px] w-[50px]">
                    {t.image && <AvatarImage src={t.image} alt={t.name} />}
                    <AvatarFallback className="bg-sky text-navy">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col pl-4 pr-6">
                    <span className="text-base font-semibold text-navy-deep">{t.name}</span>
                    {t.username && <span className="muted text-sm">{t.username}</span>}
                  </div>
                </div>
                <p className="mb-2 mt-5 text-navy-deep">{t.text}</p>
                {social
                  ? <a href={social} target="_blank" rel="noopener noreferrer" aria-label={`Open ${t.name}'s post`} className="absolute right-4 top-4 text-navy transition-opacity hover:opacity-80"><ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
                  : <Quote className="absolute right-4 top-4 h-5 w-5 text-mid/50" aria-hidden="true" />}
              </Card>
            );
          })}
        </div>

        {more && (
          <>
            <div className={cn("pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t to-transparent", fadeFrom)} />
            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
              <button type="button" className="btn btn-outline btn-sm bg-white shadow-sm" onClick={() => setShowAll(true)}>Load more</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
