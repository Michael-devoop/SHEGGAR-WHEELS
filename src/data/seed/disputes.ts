/**
 * Seed disputes.
 *
 * One open dispute on a disputed booking and one resolved dispute, so the
 * admin queue and the resolution flow both have a subject.
 */
import type { Dispute } from "@/types";

export const seedDisputes: Dispute[] = [
  {
    id: "dsp_01",
    bookingId: "bkg_08",
    openedBy: "usr_04",
    reason: "Vehicle condition",
    description:
      "The rear bumper and the left tail light were already damaged when I collected the car, and I have photos from the pickup. I would like the damage recorded so it is not charged to me at return.",
    status: "open",
    createdAt: "2026-09-19T08:00:00.000Z",
  },
  {
    id: "dsp_02",
    bookingId: "bkg_09",
    openedBy: "usr_02",
    reason: "Late return",
    description:
      "I returned the car about three hours after the agreed handover time because of traffic on the way back from the hotel. I would like the late return charge reviewed.",
    status: "resolved",
    resolutionNotes:
      "Traffic delay confirmed from the airport handover log, and the charge was waived. The renter was refunded in full and the owner was notified.",
    resolvedBy: "usr_03",
    createdAt: "2026-08-25T11:30:00.000Z",
    resolvedAt: "2026-08-28T11:30:00.000Z",
  },
];
