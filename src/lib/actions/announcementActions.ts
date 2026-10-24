/**
 * Announcement actions.
 *
 * Only admins publish. Editing is intentionally limited to switching an
 * announcement on or off, so the public record of what was said stays intact.
 */
import { STORAGE_KEYS } from "@/lib/constants";
import { listAnnouncements } from "@/lib/data/announcements";
import { getUserById } from "@/lib/data/users";
import { hasRole } from "@/lib/domain/permissions";
import { newId } from "@/lib/ids";
import { announcementDraftSchema } from "@/lib/schemas";
import { readSession } from "@/lib/storage/session";
import { localStore } from "@/lib/storage/storage";
import type { Announcement, AnnouncementDraft, Result } from "@/types";

function requireAdmin(): Result<true> {
  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to manage announcements." };
  }

  const user = getUserById(session.userId);
  if (!user || user.status === "suspended" || !hasRole(user, "admin")) {
    return { ok: false, error: "Only admins can manage announcements." };
  }

  return { ok: true, data: true };
}

export function createAnnouncement(
  input: AnnouncementDraft,
): Result<Announcement> {
  const admin = requireAdmin();
  if (!admin.ok) return admin;

  const parsed = announcementDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the announcement.",
    };
  }

  const session = readSession();
  if (!session) {
    return { ok: false, error: "Please sign in to manage announcements." };
  }

  const announcement: Announcement = {
    id: newId(),
    title: parsed.data.title,
    message: parsed.data.message,
    active: true,
    createdAt: new Date().toISOString(),
    createdBy: session.userId,
  };

  const next = [announcement, ...listAnnouncements()];
  if (!localStore.writeJson(STORAGE_KEYS.announcements, next)) {
    return {
      ok: false,
      error: "Could not save the announcement. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: announcement };
}

export function setAnnouncementActive(
  id: string,
  active: boolean,
): Result<Announcement> {
  const admin = requireAdmin();
  if (!admin.ok) return admin;

  const announcements = listAnnouncements();
  const existing = announcements.find((announcement) => announcement.id === id);
  if (!existing) {
    return { ok: false, error: "That announcement could not be found." };
  }

  if (existing.active === active) {
    return { ok: true, data: existing };
  }

  const updated: Announcement = { ...existing, active };
  const next = announcements.map((announcement) =>
    announcement.id === id ? updated : announcement,
  );

  if (!localStore.writeJson(STORAGE_KEYS.announcements, next)) {
    return {
      ok: false,
      error: "Could not save the announcement. Browser storage is unavailable.",
    };
  }

  return { ok: true, data: updated };
}
