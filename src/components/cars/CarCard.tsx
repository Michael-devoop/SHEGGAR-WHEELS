import Image from "next/image";
import Link from "next/link";
import { Armchair, MapPin } from "lucide-react";

import StarRating from "@/components/reviews/StarRating";
import { formatETB, truncate } from "@/lib/format";
import type { Car } from "@/types";

/**
 * One catalogue listing.
 *
 * The whole card is a link, so the card is a single tab stop. Rating values
 * are passed in rather than read here, which keeps the component usable from
 * either a server or client parent.
 */
export default function CarCard({
  car,
  rating,
  reviewCount,
}: {
  car: Car;
  rating: number | null;
  reviewCount: number;
}) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <Image
          src={car.photos[0]}
          alt={`${car.make} ${car.model}`}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute left-3 top-3 rounded-pill bg-surface/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">
          {formatETB(car.pricePerDay)} / day
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h2 className="text-base font-bold tracking-tight text-ink">
          {car.make} {car.model}{" "}
          <span className="font-normal text-ink-muted">{car.year}</span>
        </h2>

        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
          {car.neighbourhood}, {car.city}
        </p>

        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
          <Armchair aria-hidden="true" className="size-3.5 shrink-0" />
          {car.transmission === "automatic" ? "Automatic" : "Manual"} ·{" "}
          {car.seats} seats
        </p>

        <p className="text-sm text-ink-muted">
          {truncate(car.description, 80)}
        </p>

        <div className="mt-1">
          {rating !== null ? (
            <StarRating rating={rating} count={reviewCount} />
          ) : (
            <p className="text-sm text-ink-muted">No reviews yet</p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <p className="text-base font-bold text-ink">
            {formatETB(car.pricePerDay)}
            <span className="ml-1 text-xs font-normal text-ink-muted">
              per day
            </span>
          </p>
          <span className="text-sm font-semibold text-ink">View car →</span>
        </div>
      </div>
    </Link>
  );
}
