"use client";

import dynamic from "next/dynamic";

import ChartSkeleton from "@/components/charts/ChartSkeleton";
import { useBookings } from "@/hooks/useBookings";
import { useCars } from "@/hooks/useCars";
import { useCurrentUser } from "@/hooks/useSession";
import { getCarById } from "@/lib/data/cars";
import { buildStatusBreakdown } from "@/lib/domain/chartData";
import { formatETB } from "@/lib/format";
import { bookingStatusLabel } from "@/lib/status";
import type { BookingStatus } from "@/types";

const BookingsByStatusChart = dynamic(
  () => import("@/components/charts/BookingsByStatusChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton label="Loading bookings chart…" />,
  },
);

const COMPLETED: BookingStatus[] = ["completed", "reviewed"];
const LOST: BookingStatus[] = ["cancelled", "declined"];

export default function AdminReports() {
  const { hydrated } = useCurrentUser();
  const bookings = useBookings();
  const cars = useCars();

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading reports…
      </p>
    );
  }

  const completed = bookings.filter((booking) =>
    COMPLETED.includes(booking.status),
  );
  const lost = bookings.filter((booking) => LOST.includes(booking.status));
  const gross = completed.reduce((sum, booking) => sum + booking.total, 0);
  const decided = completed.length + lost.length;
  const cancellationRate = decided ? (lost.length / decided) * 100 : 0;
  const average = completed.length ? gross / completed.length : 0;
  const bookedDays = completed.reduce((sum, booking) => sum + booking.days, 0);

  const statusRows = buildStatusBreakdown(bookings);

  const byCar = new Map<
    string,
    { trips: number; revenue: number; days: number }
  >();
  for (const booking of completed) {
    const bucket = byCar.get(booking.carId) ?? {
      trips: 0,
      revenue: 0,
      days: 0,
    };
    bucket.trips += 1;
    bucket.revenue += booking.total;
    bucket.days += booking.days;
    byCar.set(booking.carId, bucket);
  }
  const topCars = [...byCar.entries()]
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Reports
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Computed from the bookings stored in this browser. Demo data, not an
          accounting export.
        </p>
      </header>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Completed revenue
          </dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight text-ink">
            {formatETB(gross)}
          </dd>
          <p className="mt-1 text-xs text-ink-muted">
            {completed.length} completed trips
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Average trip
          </dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight text-ink">
            {formatETB(average)}
          </dd>
          <p className="mt-1 text-xs text-ink-muted">
            {bookedDays} booked days
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Cancellation rate
          </dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight text-ink">
            {cancellationRate.toFixed(0)}%
          </dd>
          <p className="mt-1 text-xs text-ink-muted">
            {lost.length} cancelled or declined
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Listed cars
          </dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight text-ink">
            {cars.filter((car) => car.status === "approved").length}
          </dd>
          <p className="mt-1 text-xs text-ink-muted">
            {cars.length} total on record
          </p>
        </div>
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="status-breakdown">
          <h2
            id="status-breakdown"
            className="text-sm font-bold uppercase tracking-widest text-ink-muted"
          >
            Bookings by status
          </h2>
          {statusRows.length === 0 ? (
            <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
              No bookings yet.
            </p>
          ) : (
            <>
              <div className="mt-3 rounded-lg border border-border bg-surface p-4">
                <BookingsByStatusChart data={statusRows} />
              </div>
              <table className="mt-4 w-full border-collapse text-sm">
                <caption className="sr-only">
                  Number of bookings in each status
                </caption>
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-ink-muted">
                    <th scope="col" className="py-2 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Bookings
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statusRows.map((row) => (
                    <tr
                      key={row.status}
                      className="border-b border-border last:border-0"
                    >
                      <th scope="row" className="py-3 text-left font-medium text-ink">
                        {bookingStatusLabel(row.status)}
                      </th>
                      <td className="py-3 text-right text-ink-muted">
                        {row.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>

        <section aria-labelledby="top-cars">
          <h2
            id="top-cars"
            className="text-sm font-bold uppercase tracking-widest text-ink-muted"
          >
            Top cars by revenue
          </h2>
          {topCars.length === 0 ? (
            <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
              No completed trips yet.
            </p>
          ) : (
            <table className="mt-3 w-full border-collapse text-sm">
              <caption className="sr-only">
                Highest earning cars from completed trips
              </caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-ink-muted">
                  <th scope="col" className="py-2 font-semibold">
                    Car
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Trips
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {topCars.map(([carId, bucket]) => {
                  const car = getCarById(carId);
                  return (
                    <tr key={carId} className="border-b border-border last:border-0">
                      <th scope="row" className="py-3 text-left font-medium text-ink">
                        {car ? `${car.make} ${car.model}` : "Car removed"}
                      </th>
                      <td className="py-3 text-right text-ink-muted">
                        {bucket.trips}
                      </td>
                      <td className="py-3 text-right font-semibold text-ink">
                        {formatETB(bucket.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
