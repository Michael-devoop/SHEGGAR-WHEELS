/**
 * Seed announcements.
 *
 * One active banner and one inactive, so the banner bar and the admin
 * announcement manager both have a subject.
 */
import type { Announcement } from "@/types";

export const seedAnnouncements: Announcement[] = [
  {
    id: "ann_01",
    title: "Pick-up times after 8pm",
    message:
      "Owners handing over a car after 8pm please meet at the agreed point with the lights on. Share the arrival time in the booking thread so the renter is not left waiting.",
    active: true,
    createdAt: "2026-10-12T08:00:00.000Z",
    createdBy: "usr_03",
  },
  {
    id: "ann_02",
    title: "September fee promotion",
    message:
      "The platform commission was reduced to 8% for the whole of September 2026. The standard 10% applies again from October.",
    active: false,
    createdAt: "2026-08-25T08:00:00.000Z",
    createdBy: "usr_03",
  },
];
