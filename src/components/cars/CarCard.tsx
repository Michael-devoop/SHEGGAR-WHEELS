import Image from "next/image";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";

import StarRating from "@/components/reviews/StarRating";
import { formatETB } from "@/lib/format";
import type { Car } from "@/types";

export default function CarCard({
  car,
  rating,
  reviewCount,
  href = `/cars/${car.id}`,
}: {
  car: Car;
  rating: number | null;
  reviewCount: number;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
        <Image
          src={car.photos[0]}
          alt={`${car.make} ${car.model}`}
          fill
          sizes="(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 100vw"
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Transmission badge */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur-sm">
          {car.transmission === "automatic" ? "Automatic" : "Manual"}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">
            {car.make} {car.model}{" "}
            <span className="text-sm font-normal text-zinc-400">{car.year}</span>
          </h2>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 text-zinc-400" />
            {car.neighbourhood}, {car.city}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5 text-zinc-400" />
            {car.seats} seats
          </span>
        </div>

        {/* Short description */}
        <p className="line-clamp-2 text-sm text-zinc-500">
          {car.description}
        </p>

        {/* Rating */}
        <div className="text-sm">
          {rating !== null ? (
            <StarRating rating={rating} count={reviewCount} />
          ) : (
            <span className="text-zinc-400">No reviews yet</span>
          )}
        </div>

        {/* Price footer */}
        <div className="mt-auto flex items-end justify-between border-t border-zinc-100 pt-3">
          <div>
            <p className="text-xl font-bold text-zinc-900">
              {formatETB(car.pricePerDay)}
            </p>
            <p className="text-xs text-zinc-400">per day</p>
          </div>
          <span className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-zinc-700">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}
