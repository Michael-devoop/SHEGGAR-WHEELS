/**
 * Seed users.
 *
 * Every role in `ROLES` is covered so each surface has an account to sign in
 * as, and one account is suspended so the admin suspension flow has a
 * subject.
 *
 * IDs are stable strings, never generated, so bookings and reviews can
 * reference them.
 */
import type { User } from "@/types";

export const seedUsers: User[] = [
  {
    id: "usr_01",
    name: "Marta Bekele",
    email: "marta@sheggarwheels.et",
    phone: "+251911234501",
    roles: ["owner", "renter"],
    status: "active",
    createdAt: "2025-11-04T08:12:00.000Z",
  },
  {
    id: "usr_02",
    name: "Yonas Tadesse",
    email: "yonas@sheggarwheels.et",
    phone: "+251911234502",
    roles: ["renter"],
    status: "active",
    createdAt: "2026-01-19T11:40:00.000Z",
  },
  {
    id: "usr_03",
    name: "Selam Girma",
    email: "selam@sheggarwheels.et",
    phone: "+251911234503",
    roles: ["admin", "owner"],
    status: "active",
    createdAt: "2025-09-02T07:05:00.000Z",
  },
  {
    id: "usr_04",
    name: "Abel Kebede",
    email: "abel@sheggarwheels.et",
    phone: "+251911234504",
    roles: ["renter"],
    status: "suspended",
    createdAt: "2026-03-11T14:22:00.000Z",
  },
];
