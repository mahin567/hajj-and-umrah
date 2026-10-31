import { cn } from "@/lib/utils";
import { TestimonialCard } from "@/components/ui/testimonial-card";

export function TestimonialsSection({ id, title, description, testimonials, className }) {
  // Repeat enough times that the strip is always wider than the screen, even with 1–2 reviews.
  const repeat = Math.max(2, Math.ceil(8 / Math.max(testimonials.length, 1)));
  return (
    <section id={id} className={cn("bg-background text-foreground", "py-12 sm:py-24 md:py-32 px-0", className)}>
      <div className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] font-display text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">{title}</h2>
          <p className="max-w-[600px] text-base font-medium text-muted-foreground sm:text-xl">{description}</p>
        </div>
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex flex-row overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] [--duration:40s]">
            {/* Two identical tracks: the first slides out by exactly its own width while the second slides in behind it */}
            {[0, 1].map((track) => (
              <div key={track} aria-hidden={track === 1} className="flex shrink-0 flex-row justify-around [gap:var(--gap)] animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]">
                {Array.from({ length: repeat }).map((_, s) =>
                  testimonials.map((t, i) => <TestimonialCard key={`${s}-${i}`} {...t} />)
                )}
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
        </div>
      </div>
    </section>
  );
}
