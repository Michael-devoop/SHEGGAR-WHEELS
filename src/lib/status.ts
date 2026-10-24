/**
 * Display labels and tones for the status unions.
 *
 * Text and colour live together so a status cannot appear with one label in a
 * list and a different one on its detail page. The components map a tone to
 * token classes; this module stays framework-free.
 */
import type { BookingStatus, CarStatus, PaymentStatus } from "@/types";

export type StatusTone = "success" | "warning" | "info" | "danger" | "neutral";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  reviewed: "Reviewed",
  declined: "Declined",
  cancelled: "Cancelled",
  disputed: "Disputed",
  resolved: "Resolved",
};

const BOOKING_STATUS_TONE: Record<BookingStatus, StatusTone> = {
  requested: "warning",
  confirmed: "info",
  in_progress: "info",
  completed: "success",
  reviewed: "success",
  declined: "neutral",
  cancelled: "neutral",
  disputed: "danger",
  resolved: "success",
};

export const bookingStatusLabel = (status: BookingStatus): string =>
  BOOKING_STATUS_LABEL[status];

export const bookingStatusTone = (status: BookingStatus): StatusTone =>
  BOOKING_STATUS_TONE[status];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Not paid",
  held: "Payment held",
  paid: "Paid",
  refunded: "Refunded",
};

export const paymentStatusLabel = (status: PaymentStatus): string =>
  PAYMENT_STATUS_LABEL[status];

export const CAR_STATUS_LABEL: Record<CarStatus, string> = {
  draft: "Draft",
  pending: "In review",
  approved: "Live",
  rejected: "Rejected",
  inactive: "Paused",
};

const CAR_STATUS_TONE: Record<CarStatus, StatusTone> = {
  draft: "neutral",
  pending: "warning",
  approved: "success",
  rejected: "danger",
  inactive: "neutral",
};

export const carStatusLabel = (status: CarStatus): string =>
  CAR_STATUS_LABEL[status];

export const carStatusTone = (status: CarStatus): StatusTone =>
  CAR_STATUS_TONE[status];
