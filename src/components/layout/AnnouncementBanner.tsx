"use client";

import { Megaphone } from "lucide-react";

import { useAnnouncements } from "@/hooks/useAnnouncements";

/** Active notices from the admin team, shown on the public home page. */
export default function AnnouncementBanner() {
  const active = useAnnouncements().filter(
    (announcement) => announcement.active,
  );

  if (active.length === 0) return null;

  return (
    <aside
      aria-label="Announcements"
      className="border-b border-border bg-surface"
    >
      <div className="shell space-y-3 py-4">
        {active.map((announcement) => (
          <div key={announcement.id} className="flex items-start gap-3">
            <Megaphone
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-ink-muted"
            />
            <div>
              <p className="text-sm font-semibold text-ink">
                {announcement.title}
              </p>
              <p className="text-sm leading-relaxed text-ink-muted">
                {announcement.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
