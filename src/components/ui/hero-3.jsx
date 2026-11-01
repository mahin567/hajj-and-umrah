import { m } from "framer-motion";
import { cn } from "@/lib/utils";

// Adapted from the "AnimatedMarqueeHero" block (hero-3). The project is plain JS/JSX, so no TypeScript types.
// Change from the original: the moving strip carries any React nodes (here, package cards) instead of only images.
const FADE = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export function AnimatedMarqueeHero({ id, tagline, title, description, cta, items, className }) {
  return (
    <section id={id} className={cn("section defer relative w-full overflow-hidden bg-sky !pb-8 md:!pb-10", className)}>
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        <m.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={FADE}
          className="mb-4 inline-block rounded-full border border-mid/30 bg-white/70 px-4 py-1.5 text-sm font-medium text-navy backdrop-blur-sm">
          {tagline}
        </m.div>

        <m.h2 initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="text-4xl md:text-6xl">
          {typeof title === "string"
            ? title.split(" ").map((w, i) => <m.span key={i} variants={FADE} className="inline-block">{w}&nbsp;</m.span>)
            : title}
        </m.h2>

        <m.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={FADE} transition={{ delay: 0.3 }}
          className="muted mt-6 max-w-xl text-base md:text-lg">
          {description}
        </m.p>

        {cta && (
          <m.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={FADE} transition={{ delay: 0.4 }} className="mt-8">
            {cta}
          </m.div>
        )}
      </div>

      {/* Moving strip: two identical tracks, so the loop has no jump. Pauses on hover; still if motion is reduced. */}
      <div className="group relative mt-12 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="flex py-4 [--gap:1.25rem] [gap:var(--gap)] [--duration:70s] motion-reduce:overflow-x-auto">
          {[0, 1].map((track) => (
            <div key={track} aria-hidden={track === 1 || undefined} inert={track === 1 ? "" : undefined}
              className="flex shrink-0 [gap:var(--gap)] animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
              {items.map((node, i) => (
                <div key={i} className="w-[260px] shrink-0">{node}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
