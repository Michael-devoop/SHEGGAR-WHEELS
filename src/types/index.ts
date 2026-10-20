/**
 * Domain types.
 *
 * Every union is derived from the constant arrays in `@/lib/constants`, so a
 * new status cannot be added to the runtime data without also being valid in
 * the type system.
 */
import type {
  BOOKING_STATUSES,
  CAR_STATUSES,
  DISPUTE_STATUSES,
  PAYMENT_STATUSES,
  ROLES,
  TRANSMISSIONS,
  USER_STATUSES,
} from "@/lib/constants";

export type Role = (typeof ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type CarStatus = (typeof CAR_STATUSES)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

/** Calendar date, `YYYY-MM-DD`. Always interpreted in UTC. */
export type ISODate = string;

/** Full ISO 8601 timestamp, e.g. `2026-10-20T09:30:00.000Z`. */
export type ISODateTime = string;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: Role[];
  status: UserStatus;
  createdAt: ISODateTime;
}

export interface Car {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  transmission: Transmission;
  seats: number;
  city: string;
  neighbourhood: string;
  latitude: number;
  longitude: number;
  pricePerDay: number;
  photos: string[];
  description: string;
  status: CarStatus;
  unavailableDates: ISODate[];
  createdAt: ISODateTime;
}

export interface Booking {
  id: string;
  carId: string;
  renterId: string;
  ownerId: string;
  startDate: ISODate;
  endDate: ISODate;
  days: number;
  /** Price snapshot, captured at booking time so later edits cannot rewrite history. */
  pricePerDay: number;
  subtotal: number;
  fee: number;
  total: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Review {
  id: string;
  bookingId: string;
  carId: string;
  renterId: string;
  ownerId: string;
  rating: number;
  comment: string;
  ownerReply?: string;
  createdAt: ISODateTime;
}

export interface Dispute {
  id: string;
  bookingId: string;
  openedBy: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolutionNotes?: string;
  resolvedBy?: string;
  createdAt: ISODateTime;
  resolvedAt?: ISODateTime;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  active: boolean;
  createdAt: ISODateTime;
  createdBy: string;
}

export interface Session {
  userId: string;
  signedInAt: ISODateTime;
}
