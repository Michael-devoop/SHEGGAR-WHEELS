import { Check } from "lucide-react";

import { bookingStatusLabel } from "@/lib/status";
import type { Booking } from "@/types";

const STEPS = [
  { status: "requested", label: "Requested" },
  { status: "confirmed", label: "Confirmed" },
  { status: "in_progress", label: "Picked up" },
  { status: "completed", label: "Returned" },
  { status: "reviewed", label: "Reviewed" },
] as const;

const TERMINAL = ["declined", "cancelled", "disputed", "resolved"] as const;

/**
 * The happy-path timeline, with the current step marked.
 *
 * A terminal status is shown as an interruption above the timeline instead of
 * pretending the trip reached a later step.
 */
export default function StatusTimeline({ booking }: { booking: Booking }) {
  const index = STEPS.findIndex((step) => step.status === booking.status);
  const terminal = TERMINAL.includes(
    booking.status as (typeof TERMINAL)[number],
  );

  return (
    <div>
      {terminal ? (
        <p
          className={
            booking.status === "declined" || booking.status === "cancelled"
              ? "mb-4 rounded-md bg-neutral-bg px-3 py-2 text-sm font-medium text-neutral"
              : "mb-4 rounded-md bg-warning-bg px-3 py-2 text-sm font-medium text-warning"
          }
        >
          This trip is {bookingStatusLabel(booking.status).toLowerCase()}.
        </p>
      ) : null}

      <ol className="space-y-0">
        {STEPS.map((step, position) => {
          const done = index >= position && index !== -1;
          const current = index === position;
          return (
            <li key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={
                    done
                      ? "grid size-7 shrink-0 place-items-center rounded-pill bg-primary text-on-primary"
                      : "grid size-7 shrink-0 place-items-center rounded-pill border border-border bg-surface text-xs font-semibold text-ink-muted"
                  }
                >
                  {done ? <Check className="size-4" /> : position + 1}
                </span>
                {position < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={
                      done
                        ? "h-8 w-px bg-primary"
                        : "h-8 w-px bg-border"
                    }
                  />
                ) : null}
              </div>
              <div className="pb-6">
                <p
                  aria-current={current ? "step" : undefined}
                  className={
                    current
                      ? "text-sm font-semibold text-ink"
                      : done
                        ? "text-sm font-medium text-ink"
                        : "text-sm text-ink-muted"
                  }
                >
                  {step.label}
                  {current ? (
                    <span className="ml-2 text-xs font-normal text-ink-muted">
                      now
                    </span>
                  ) : null}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
