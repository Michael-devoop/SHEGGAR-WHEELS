"use client";

import { useState, type FormEvent } from "react";

import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useCurrentUser } from "@/hooks/useSession";
import {
  createAnnouncement,
  setAnnouncementActive,
} from "@/lib/actions/announcementActions";
import { getUserById } from "@/lib/data/users";
import { formatDateTime } from "@/lib/format";

export default function AdminAnnouncements() {
  const { hydrated } = useCurrentUser();
  const announcements = useAnnouncements();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading announcements…
      </p>
    );
  }

  const active = announcements.filter((announcement) => announcement.active);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const result = createAnnouncement({ title, message });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTitle("");
    setMessage("");
  }

  function toggle(id: string, next: boolean) {
    setError(null);
    const result = setAnnouncementActive(id, next);
    if (!result.ok) setError(result.error);
  }

  return (
    <div>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Announcements
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Active announcements appear on the public home page. Turning one off
          keeps it on the record.
        </p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <section
          aria-labelledby="new-announcement"
          className="rounded-lg border border-border bg-surface p-4"
        >
          <h2
            id="new-announcement"
            className="text-sm font-bold uppercase tracking-widest text-ink-muted"
          >
            Publish
          </h2>
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="ann-title" className="text-sm font-medium text-ink">
                Title
              </label>
              <input
                id="ann-title"
                required
                maxLength={80}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ann-message" className="text-sm font-medium text-ink">
                Message
              </label>
              <textarea
                id="ann-message"
                required
                rows={5}
                maxLength={600}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30"
              />
            </div>
            {error ? (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Publish announcement
            </button>
          </form>
        </section>

        <section aria-labelledby="announcement-list">
          <div className="flex items-baseline justify-between gap-2">
            <h2
              id="announcement-list"
              className="text-sm font-bold uppercase tracking-widest text-ink-muted"
            >
              Published
            </h2>
            <p className="text-xs text-ink-muted">{active.length} active</p>
          </div>

          {announcements.length === 0 ? (
            <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
              Nothing published yet.
            </p>
          ) : (
            <ul role="list" className="mt-3 grid gap-3">
              {announcements.map((announcement) => {
                const author = getUserById(announcement.createdBy);
                return (
                  <li
                    key={announcement.id}
                    className="rounded-lg border border-border bg-surface p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">
                          {announcement.title}
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">
                          {formatDateTime(announcement.createdAt)}
                          {author ? ` · ${author.name}` : ""}
                        </p>
                      </div>
                      <span
                        className={
                          announcement.active
                            ? "rounded-pill bg-success-bg px-2.5 py-1 text-xs font-semibold text-success"
                            : "rounded-pill bg-neutral-bg px-2.5 py-1 text-xs font-semibold text-neutral"
                        }
                      >
                        {announcement.active ? "Active" : "Off"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {announcement.message}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        toggle(announcement.id, !announcement.active)
                      }
                      className="mt-3 inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
                    >
                      {announcement.active
                        ? "Turn off"
                        : "Publish again"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
