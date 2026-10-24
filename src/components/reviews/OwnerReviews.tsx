"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import StarRating from "@/components/reviews/StarRating";
import { useCurrentUser } from "@/hooks/useSession";
import { useReviews } from "@/hooks/useReviews";
import { replyToReview } from "@/lib/actions/reviewActions";
import { getCarById } from "@/lib/data/cars";
import { getUserById } from "@/lib/data/users";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types";

function ReviewRow({ review }: { review: Review }) {
  const [reply, setReply] = useState(review.ownerReply ?? "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const car = getCarById(review.carId);
  const renter = getUserById(review.renterId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const result = replyToReview(review.id, reply);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditing(false);
  }

  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-ink">
            {car ? `${car.make} ${car.model}` : "Car no longer listed"}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {renter?.name ?? "A renter"} · {formatDate(review.createdAt)}
          </p>
        </div>
        <StarRating rating={review.rating} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink">{review.comment}</p>

      {review.ownerReply && !editing ? (
        <blockquote className="mt-3 border-l-2 border-border pl-3">
          <p className="text-sm leading-relaxed text-ink-muted">
            {review.ownerReply}
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
          >
            Edit reply
          </button>
        </blockquote>
      ) : editing ? (
        <form onSubmit={handleSubmit} className="mt-3">
          <label
            htmlFor={`reply-${review.id}`}
            className="text-sm font-medium text-ink"
          >
            Your reply
          </label>
          <textarea
            id={`reply-${review.id}`}
            required
            rows={3}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
            placeholder="Reply publicly to this review."
          />
          {error ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Save reply
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setReply(review.ownerReply ?? "");
              }}
              className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-3 inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          Reply publicly
        </button>
      )}
    </li>
  );
}

export default function OwnerReviews() {
  const { user, hydrated } = useCurrentUser();
  const reviews = useReviews();

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading reviews…
      </p>
    );
  }

  const mine = user
    ? reviews.filter((review) => review.ownerId === user.id)
    : [];
  const unanswered = mine.filter((review) => !review.ownerReply);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Reviews
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Public feedback from renters. A short, calm reply helps the next
            renter decide.
          </p>
        </div>
        <Link
          href="/owner/cars"
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          My cars
        </Link>
      </header>

      <p className="mt-4 text-sm text-ink-muted">
        {mine.length} {mine.length === 1 ? "review" : "reviews"} ·{" "}
        {unanswered.length} without a reply
      </p>

      {mine.length === 0 ? (
        <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
          No reviews yet. They appear after renters complete a trip.
        </p>
      ) : (
        <ul role="list" className="mt-3 grid gap-3">
          {mine.map((review) => (
            <ReviewRow key={review.id} review={review} />
          ))}
        </ul>
      )}
    </div>
  );
}
