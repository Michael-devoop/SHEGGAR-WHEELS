import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Armchair,
  CalendarDays,
  CircleGauge,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/reviews/StarRating";
import { getCarById, listCars } from "@/lib/data/cars";
import { averageRatingForCar, listReviewsForCar } from "@/lib/data/reviews";
import { getUserById } from "@/lib/data/users";
import { formatDate, formatETB } from "@/lib/format";

export function generateStaticParams() {
  return listCars().map((car) => ({ id: car.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = getCarById(id);
  if (!car) return { title: "Car not found" };

  return {
    title: `${car.make} ${car.model} in ${car.neighbourhood}`,
    description: car.description,
  };
}

const STATUS_LABEL: Record<string, string> = {
  approved: "Available to book",
  pending: "Awaiting review",
  draft: "Not published",
  rejected: "Not listed",
  inactive: "Temporarily off the road",
};

export default async function CarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = getCarById(id);
  if (!car) notFound();

  const owner = getUserById(car.ownerId);
  const reviews = listReviewsForCar(car.id);
  const rating = averageRatingForCar(car.id);
  const bookable = car.status === "approved";
  const photo = car.photos[0];

  return (
    <div className="shell py-5 lg:py-8">
      <Link
        href="/cars"
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> All cars
      </Link>

      <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
        {/* ---- Main column ------------------------------------------- */}
        <div className="order-2 min-w-0 lg:order-1">
          <figure className="overflow-hidden rounded-lg border border-border bg-surface-2">
            <Image
              src={photo}
              alt={`${car.make} ${car.model}, ${car.year}`}
              width={800}
              height={600}
              priority
              // The listings carry an SVG placeholder. The image optimizer
              // does not rasterise SVG, so it is served as-is.
              unoptimized
              className="aspect-[4/3] w-full object-cover"
            />
          </figure>

          <div className="mt-5 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  bookable
                    ? "rounded-pill bg-success-bg px-2.5 py-1 text-xs font-semibold text-success"
                    : "rounded-pill bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning"
                }
              >
                {STATUS_LABEL[car.status] ?? car.status}
              </span>
              <span className="inline-flex items-center gap-1 rounded-pill bg-surface px-2.5 py-1 text-xs font-medium text-ink-muted">
                <MapPin aria-hidden="true" className="size-3.5" />
                {car.neighbourhood}, {car.city}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-ink lg:text-3xl">
              {car.make} {car.model}
            </h1>

            <p className="text-sm text-ink-muted">
              {car.year} · {car.transmission === "automatic" ? "Automatic" : "Manual"}{" "}
              · {car.seats} seats
            </p>

            {rating !== null ? (
              <StarRating rating={rating} count={reviews.length} size="md" />
            ) : (
              <p className="text-sm text-ink-muted">No reviews yet</p>
            )}
          </div>

          {/* ---- Specs ------------------------------------------------ */}
          <section aria-labelledby="specs" className="mt-8">
            <h2 id="specs" className="text-lg font-bold tracking-tight text-ink">
              The basics
            </h2>

            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <div className="flex items-start gap-2.5">
                <CircleGauge aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                <div>
                  <dt className="text-xs text-ink-muted">Transmission</dt>
                  <dd className="text-sm font-medium text-ink">
                    {car.transmission === "automatic" ? "Automatic" : "Manual"}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Armchair aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                <div>
                  <dt className="text-xs text-ink-muted">Seats</dt>
                  <dd className="text-sm font-medium text-ink">{car.seats}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                <div>
                  <dt className="text-xs text-ink-muted">Year</dt>
                  <dd className="text-sm font-medium text-ink">{car.year}</dd>
                </div>
              </div>
            </dl>
          </section>

          {/* ---- Description ------------------------------------------ */}
          <section aria-labelledby="about" className="mt-8">
            <h2 id="about" className="text-lg font-bold tracking-tight text-ink">
              About this car
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {car.description}
            </p>
          </section>

          {/* ---- Owner ------------------------------------------------ */}
          {owner ? (
            <section aria-labelledby="owner" className="mt-8">
              <h2 id="owner" className="text-lg font-bold tracking-tight text-ink">
                The owner
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-pill bg-surface-2 text-base font-bold text-ink"
                >
                  {owner.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{owner.name}</p>
                  <p className="text-sm text-ink-muted">
                    Member since {formatDate(owner.createdAt)}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {/* ---- Reviews ---------------------------------------------- */}
          <section aria-labelledby="reviews" className="mt-8">
            <h2 id="reviews" className="text-lg font-bold tracking-tight text-ink">
              Reviews
            </h2>

            {reviews.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Nobody has reviewed this car yet.
              </p>
            ) : (
              <ul role="list" className="mt-3 divide-y divide-border">
                {reviews.map((review) => {
                  const reviewer = getUserById(review.renterId);
                  return (
                    <li key={review.id} className="py-4">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-ink-muted">
                          {reviewer?.name ?? "A renter"} ·{" "}
                          {formatDate(review.createdAt)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-ink">
                        {review.comment}
                      </p>

                      {review.ownerReply ? (
                        <blockquote className="mt-3 border-l-2 border-border pl-3">
                          <p className="text-sm leading-relaxed text-ink-muted">
                            {review.ownerReply}
                          </p>
                          <footer className="mt-1 text-xs text-ink-muted">
                            — {owner?.name ?? "Owner"}
                          </footer>
                        </blockquote>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* ---- Booking panel ------------------------------------------ */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-20">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <p className="text-2xl font-bold tracking-tight text-ink">
              {formatETB(car.pricePerDay)}
              <span className="ml-1 text-sm font-normal text-ink-muted">
                per day
              </span>
            </p>

            {car.unavailableDates.length > 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Booked on{" "}
                {car.unavailableDates
                  .slice(0, 3)
                  .map((date) => formatDate(date))
                  .join(", ")}
                {car.unavailableDates.length > 3
                  ? ` and ${car.unavailableDates.length - 3} more day${car.unavailableDates.length - 3 === 1 ? "" : "s"}`
                  : ""}
                .
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">Free for every date.</p>
            )}

            {bookable ? (
              <Button asChild className="mt-4 h-11 w-full">
                <Link href={`/renter/checkout?carId=${car.id}`}>
                  Request to book
                </Link>
              </Button>
            ) : (
              <p className="mt-4 rounded-md bg-warning-bg px-3 py-2 text-sm text-warning">
                This listing is not open for booking right now.
              </p>
            )}

            <ul role="list" className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              <li className="flex items-center gap-2 text-sm text-ink-muted">
                <ShieldCheck aria-hidden="true" className="size-4 shrink-0" />
                The fee is included in the price you see
              </li>
              <li className="flex items-center gap-2 text-sm text-ink-muted">
                <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
                Free cancellation up to 24 hours before
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
