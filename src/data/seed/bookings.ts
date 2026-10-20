/**
 * Seed bookings.
 *
 * Every status in `BOOKING_STATUSES` appears at least once, so the booking
 * table, the status timeline and the admin filters all have something to
 * show. Dates are spread around 20 October 2026: live bookings sit around
 * today, the rest sit in the past.
 *
 * The price snapshot is derived from the daily rate and the rental length
 * rather than typed out, so `subtotal`, `fee` and `total` can never drift
 * apart. The end date is the return day.
 */
import type { Booking, BookingStatus, PaymentStatus } from "@/types";
import { daysBetween, priceFor } from "./helpers";

interface BookingInput {
  id: string;
  carId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  pricePerDay: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

function booking(input: BookingInput): Booking {
  const days = daysBetween(input.startDate, input.endDate);
  const { subtotal, fee, total } = priceFor(input.pricePerDay, days);
  return { ...input, days, subtotal, fee, total };
}

export const seedBookings: Booking[] = [
  booking({
    id: "bkg_01",
    carId: "car_01",
    renterId: "usr_02",
    ownerId: "usr_01",
    startDate: "2026-10-26",
    endDate: "2026-10-29",
    pricePerDay: 2400,
    paymentStatus: "unpaid",
    status: "requested",
    createdAt: "2026-10-18T08:20:00.000Z",
    updatedAt: "2026-10-18T08:20:00.000Z",
  }),
  booking({
    id: "bkg_02",
    carId: "car_03",
    renterId: "usr_04",
    ownerId: "usr_01",
    startDate: "2026-11-02",
    endDate: "2026-11-05",
    pricePerDay: 1800,
    paymentStatus: "held",
    status: "confirmed",
    createdAt: "2026-10-15T12:05:00.000Z",
    updatedAt: "2026-10-16T09:10:00.000Z",
  }),
  booking({
    id: "bkg_03",
    carId: "car_06",
    renterId: "usr_02",
    ownerId: "usr_01",
    startDate: "2026-10-19",
    endDate: "2026-10-22",
    pricePerDay: 4500,
    paymentStatus: "paid",
    status: "in_progress",
    createdAt: "2026-10-10T10:30:00.000Z",
    updatedAt: "2026-10-19T07:45:00.000Z",
  }),
  booking({
    id: "bkg_04",
    carId: "car_02",
    renterId: "usr_04",
    ownerId: "usr_01",
    startDate: "2026-10-10",
    endDate: "2026-10-13",
    pricePerDay: 1500,
    paymentStatus: "paid",
    status: "completed",
    createdAt: "2026-10-01T15:50:00.000Z",
    updatedAt: "2026-10-13T17:00:00.000Z",
  }),
  booking({
    id: "bkg_05",
    carId: "car_05",
    renterId: "usr_02",
    ownerId: "usr_01",
    startDate: "2026-09-28",
    endDate: "2026-10-01",
    pricePerDay: 1700,
    paymentStatus: "paid",
    status: "reviewed",
    createdAt: "2026-09-18T11:40:00.000Z",
    updatedAt: "2026-10-02T08:15:00.000Z",
  }),
  booking({
    id: "bkg_06",
    carId: "car_07",
    renterId: "usr_04",
    ownerId: "usr_01",
    startDate: "2026-10-05",
    endDate: "2026-10-07",
    pricePerDay: 2600,
    paymentStatus: "unpaid",
    status: "declined",
    createdAt: "2026-09-30T14:25:00.000Z",
    updatedAt: "2026-10-01T07:10:00.000Z",
  }),
  booking({
    id: "bkg_07",
    carId: "car_09",
    renterId: "usr_02",
    ownerId: "usr_01",
    startDate: "2026-10-08",
    endDate: "2026-10-09",
    pricePerDay: 3800,
    paymentStatus: "refunded",
    status: "cancelled",
    createdAt: "2026-10-04T09:55:00.000Z",
    updatedAt: "2026-10-05T10:20:00.000Z",
  }),
  booking({
    id: "bkg_08",
    carId: "car_04",
    renterId: "usr_04",
    ownerId: "usr_01",
    startDate: "2026-09-15",
    endDate: "2026-09-18",
    pricePerDay: 1400,
    paymentStatus: "held",
    status: "disputed",
    createdAt: "2026-09-05T16:30:00.000Z",
    updatedAt: "2026-09-19T08:00:00.000Z",
  }),
  booking({
    id: "bkg_09",
    carId: "car_08",
    renterId: "usr_02",
    ownerId: "usr_01",
    startDate: "2026-08-20",
    endDate: "2026-08-24",
    pricePerDay: 6500,
    paymentStatus: "refunded",
    status: "resolved",
    createdAt: "2026-08-10T13:45:00.000Z",
    updatedAt: "2026-08-28T11:30:00.000Z",
  }),
  booking({
    id: "bkg_10",
    carId: "car_01",
    renterId: "usr_04",
    ownerId: "usr_01",
    startDate: "2026-10-12",
    endDate: "2026-10-14",
    pricePerDay: 2400,
    paymentStatus: "paid",
    status: "reviewed",
    createdAt: "2026-10-02T10:10:00.000Z",
    updatedAt: "2026-10-15T09:05:00.000Z",
  }),
  booking({
    id: "bkg_11",
    carId: "car_03",
    renterId: "usr_02",
    ownerId: "usr_01",
    startDate: "2026-09-05",
    endDate: "2026-09-07",
    pricePerDay: 1800,
    paymentStatus: "paid",
    status: "reviewed",
    createdAt: "2026-08-25T14:00:00.000Z",
    updatedAt: "2026-09-08T08:40:00.000Z",
  }),
  booking({
    id: "bkg_12",
    carId: "car_09",
    renterId: "usr_04",
    ownerId: "usr_01",
    startDate: "2026-08-05",
    endDate: "2026-08-09",
    pricePerDay: 3800,
    paymentStatus: "paid",
    status: "completed",
    createdAt: "2026-07-20T09:20:00.000Z",
    updatedAt: "2026-08-09T16:50:00.000Z",
  }),
];
