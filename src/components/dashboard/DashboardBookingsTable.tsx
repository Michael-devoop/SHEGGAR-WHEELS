"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import {
  AnimatedTableRow,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/animated-table-rows";
import { getCarById } from "@/lib/data/cars";
import { getUserById } from "@/lib/data/users";
import { formatDate, formatETB } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types";

type Variant = "renter" | "owner" | "admin";

type Props = {
  variant: Variant;
  bookings: Booking[];
  empty: ReactNode;
  className?: string;
};

const COPY = {
  renter: {
    title: "Upcoming trips",
    description: "The trips you have requested or booked.",
    href: "/renter/bookings",
    linkLabel: "All bookings",
    noun: "trip",
  },
  owner: {
    title: "Waiting for you",
    description: "Requests that need your answer.",
    href: "/owner/bookings",
    linkLabel: "All requests",
    noun: "request",
  },
  admin: {
    title: "Recent bookings",
    description: "The latest bookings across the marketplace.",
    href: "/admin/bookings",
    linkLabel: "All bookings",
    noun: "booking",
  },
} as const;

export default function DashboardBookingsTable({
  variant,
  bookings,
  empty,
  className,
}: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const copy = COPY[variant];
  const headingId = `dashboard-${variant}-bookings`;
  const isOwner = variant === "owner";
  const isAdmin = variant === "admin";
  const amountLabel = "Total";
  const total = bookings.reduce((sum, booking) => sum + booking.total, 0);

  return (
    <section
      aria-labelledby={headingId}
      data-surface="dark"
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-6">
        <div>
          <h2
            id={headingId}
            className="text-sm font-bold uppercase tracking-widest text-ink-muted"
          >
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{copy.description}</p>
        </div>
        <Link
          href={copy.href}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-ink-muted"
        >
          {copy.linkLabel}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="border-t border-border px-4 py-8 sm:px-6">{empty}</div>
      ) : (
        <Table
          className="min-w-[42rem] border-t border-border"
          containerProps={{
            tabIndex: 0,
            role: "region",
            "aria-labelledby": headingId,
            className:
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          }}
        >
          <TableCaption className="sr-only">
            {copy.title}: {bookings.length}{" "}
            {bookings.length === 1 ? copy.noun : `${copy.noun}s`}.
          </TableCaption>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {isAdmin ? <TableHead>Booking</TableHead> : null}
              <TableHead>{isOwner ? "Renter / car" : "Car"}</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="text-right">{amountLabel}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {bookings.map((booking, index) => {
                const car = getCarById(booking.carId);
                const renter = isOwner
                  ? getUserById(booking.renterId)
                  : undefined;
                const carLabel = car
                  ? `${car.make} ${car.model}`
                  : "Car removed";
                const amount = booking.total;
                const href =
                  variant === "renter"
                    ? `/renter/bookings/${booking.id}`
                    : copy.href;
                const actionLabel =
                  variant === "renter"
                    ? `View ${carLabel} booking`
                    : variant === "owner"
                      ? `Open requests for ${carLabel}`
                      : `Open booking ${booking.id}`;

                return (
                  <AnimatedTableRow
                    key={booking.id}
                    initial={{
                      opacity: 0,
                      x: reduceMotion ? 0 : -16,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduceMotion ? 0 : -40 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.35,
                      delay: reduceMotion ? 0 : index * 0.05,
                    }}
                  >
                    {isAdmin ? (
                      <TableCell className="font-mono text-xs text-ink-muted">
                        {booking.id}
                      </TableCell>
                    ) : null}
                    <TableCell className="whitespace-normal">
                      {isOwner ? (
                        <>
                          <p className="font-medium text-ink">
                            {renter?.name ?? "A renter"}
                          </p>
                          <p className="text-xs text-ink-muted">{carLabel}</p>
                        </>
                      ) : (
                        <p className="font-medium text-ink">{carLabel}</p>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-ink-muted">
                      {formatDate(booking.startDate)} →{" "}
                      {formatDate(booking.endDate)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-ink">
                      {formatETB(amount)}
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={href}
                        aria-label={actionLabel}
                        className="inline-flex size-11 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                      </Link>
                    </TableCell>
                  </AnimatedTableRow>
                );
              })}
            </AnimatePresence>
          </TableBody>
          <TableFooter>
            <TableRow className="border-border hover:bg-transparent">
              <TableCell
                colSpan={isAdmin ? 3 : 2}
                className="text-ink-muted"
              >
                {bookings.length}{" "}
                {bookings.length === 1 ? copy.noun : `${copy.noun}s`}
              </TableCell>
              <TableCell className="text-right font-semibold text-ink">
                {formatETB(total)}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </section>
  );
}
