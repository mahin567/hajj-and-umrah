import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function TestimonialCard({ author, text, href, className }) {
  const Card = href ? "a" : "div";
  const initials = author.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-lg border-t border-mid/20",
        "bg-gradient-to-b from-muted/50 to-muted/10",
        "p-4 text-start sm:p-6",
        "hover:from-muted/60 hover:to-muted/20",
        "w-[300px] max-w-[320px] shrink-0 transition-colors duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-base font-semibold leading-none">{author.name}</h3>
          {author.handle && <p className="mt-1 text-sm text-muted-foreground">{author.handle}</p>}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground sm:text-base">{text}</p>
    </Card>
  );
}
