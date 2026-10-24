import { beforeEach, describe, expect, it, vi } from "vitest";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length(): number {
    return this.data.size;
  }
  clear(): void {
    this.data.clear();
  }
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

const local = new MemoryStorage();
const session = new MemoryStorage();

vi.stubGlobal("window", {
  localStorage: local,
  sessionStorage: session,
});

const { createAnnouncement, setAnnouncementActive } = await import(
  "@/lib/actions/announcementActions"
);
const { signInWithEmail } = await import("@/lib/actions/authActions");
const { listAnnouncements, listActiveAnnouncements } = await import(
  "@/lib/data/announcements"
);

beforeEach(() => {
  local.clear();
  session.clear();
});

describe("announcements", () => {
  it("lets an admin publish an active announcement", () => {
    signInWithEmail("selam@example.com");
    const result = createAnnouncement({
      title: "Holiday handover",
      message: "Meet at the usual point; allow ten extra minutes.",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.active).toBe(true);
    expect(listActiveAnnouncements().some((a) => a.id === result.data.id)).toBe(
      true,
    );
  });

  it("toggles an announcement off and on", () => {
    signInWithEmail("selam@example.com");
    const created = createAnnouncement({
      title: "Quiet hours",
      message: "No handovers between midnight and five in the morning.",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const off = setAnnouncementActive(created.data.id, false);
    expect(off.ok).toBe(true);
    if (!off.ok) return;
    expect(off.data.active).toBe(false);

    const on = setAnnouncementActive(created.data.id, true);
    expect(on.ok).toBe(true);
    if (!on.ok) return;
    expect(on.data.active).toBe(true);
  });

  it("rejects short copy, non-admins and unknown ids", () => {
    signInWithEmail("selam@example.com");
    expect(createAnnouncement({ title: "Hi", message: "Short" }).ok).toBe(
      false,
    );

    signInWithEmail("marta@example.com");
    expect(
      createAnnouncement({
        title: "Not allowed",
        message: "This should not be published by a renter.",
      }).ok,
    ).toBe(false);

    signInWithEmail("selam@example.com");
    expect(setAnnouncementActive("ann_missing", false).ok).toBe(false);
    expect(listAnnouncements().length).toBeGreaterThan(0);
  });
});
