import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A rating out of five.
 *
 * The stars are decorative, so the rating is also written out for screen
 * readers. `count` adds the number of reviews next to it.
 */
export default function StarRating({
  rating,
  count,
  className,
  size = "sm",
}: {
  rating: number;
  count?: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const filled = Math.round(rating);
  const starSize = size === "md" ? "size-5" : "size-4";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span aria-hidden="true" className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((position) => (
          <Star
            key={position}
            className={cn(
              starSize,
              position <= filled
                ? "fill-accent text-accent"
                : "fill-transparent text-border",
            )}
          />
        ))}
      </span>

      <span className={cn("font-medium text-ink", size === "md" && "text-base")}>
        {rating.toFixed(1)}
      </span>

      {count !== undefined ? (
        <span className="text-ink-muted">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      ) : null}

      <span className="sr-only">Rated {rating.toFixed(1)} out of 5</span>
    </span>
  );
}
