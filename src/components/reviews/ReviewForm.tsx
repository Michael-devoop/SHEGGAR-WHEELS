"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import { useBookings } from "@/hooks/useBookings";
import { useReviews } from "@/hooks/useReviews";
import { useCurrentUser } from "@/hooks/useSession";
import { createReview } from "@/lib/actions/reviewActions";
import { getCarById } from "@/lib/data/cars";

export default function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { user, hydrated } = useCurrentUser();
  const bookings = useBookings();
  const reviews = useReviews();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading this trip…
      </p>
    );
  }

  const booking = bookings.find((entry) => entry.id === bookingId);
  if (!booking || !user || booking.renterId !== user.id) {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Booking not found
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          You can only review trips that you booked.
        </p>
        <Link
          href="/renter/bookings"
          className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          My bookings
        </Link>
      </div>
    );
  }

  const existing = reviews.find((review) => review.bookingId === booking.id);
  const car = getCarById(booking.carId);
  const carName = car ? `${car.make} ${car.model}` : "your trip";

  if (existing) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Already reviewed
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          You reviewed {carName} with {existing.rating} out of 5.
        </p>
        <Link
          href={`/renter/bookings/${booking.id}`}
          className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          Back to the booking
        </Link>
      </div>
    );
  }

  if (booking.status !== "completed") {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
        <h1 className="text-xl font-bold tracking-tight text-ink">
          This trip cannot be reviewed yet
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Reviews open after the trip is marked returned.
        </p>
        <Link
          href={`/renter/bookings/${booking.id}`}
          className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          Back to the booking
        </Link>
      </div>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!booking) return;

    const result = createReview({
      bookingId: booking.id,
      rating,
      comment,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(`/renter/bookings/${booking.id}`);
    router.refresh();
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        Review {carName}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Your review is public on the listing. It cannot be edited after you
        submit it.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <fieldset>
          <legend className="text-sm font-medium text-ink">Rating</legend>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <label
                key={value}
                className="cursor-pointer rounded-md p-1 focus-within:ring-2 focus-within:ring-focus/40"
              >
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                  className="peer sr-only"
                  aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                />
                <Star
                  aria-hidden="true"
                  className={
                    value <= rating
                      ? "size-8 fill-highlight text-highlight"
                      : "size-8 fill-transparent text-border peer-focus-visible:text-ink"
                  }
                />
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-1.5">
          <label htmlFor="comment" className="text-sm font-medium text-ink">
            Comment
          </label>
          <textarea
            id="comment"
            name="comment"
            required
            rows={6}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
            placeholder="How was the car, the handover, and the owner's communication?"
          />
          <p className="text-xs text-ink-muted">
            At least 10 characters. Be specific and fair.
          </p>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Publish review
          </button>
          <Link
            href={`/renter/bookings/${booking.id}`}
            className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
