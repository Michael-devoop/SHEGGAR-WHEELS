import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CarDraft } from "@/types";

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

const {
  createCar,
  moderateCar,
  setCarPublished,
  toggleUnavailableDate,
  updateCar,
} = await import("@/lib/actions/carActions");
const { listBookings } = await import("@/lib/data/bookings");
const { signInWithEmail, signOutAction } = await import(
  "@/lib/actions/authActions"
);
const { getCarById, listCarsByOwner } = await import("@/lib/data/cars");

const draft: CarDraft = {
  make: "Kia",
  model: "Rio",
  year: 2021,
  transmission: "automatic",
  seats: 5,
  neighbourhood: "Summit",
  pricePerDay: 2100,
  description:
    "Compact automatic with a clean interior, ideal for city errands and airport runs.",
};

beforeEach(() => {
  local.clear();
  session.clear();
});

describe("createCar", () => {
  it("creates a pending listing owned by the signed-in owner", () => {
    signInWithEmail("marta@example.com");
    const result = createCar(draft);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.ownerId).toBe("usr_01");
    expect(result.data.status).toBe("pending");
    expect(result.data.city).toBe("Addis Ababa");
    expect(result.data.photos).toHaveLength(1);
    expect(result.data.description).toBe(draft.description);
    expect(getCarById(result.data.id)?.model).toBe("Rio");
    expect(listCarsByOwner("usr_01").some((car) => car.id === result.data.id)).toBe(
      true,
    );
  });

  it("refuses a renter, a signed-out visitor and invalid details", () => {
    signInWithEmail("yonas@example.com");
    expect(createCar(draft).ok).toBe(false);

    signOutAction();
    expect(createCar(draft).ok).toBe(false);

    signInWithEmail("marta@example.com");
    expect(createCar({ ...draft, description: "Too short" }).ok).toBe(false);
    expect(createCar({ ...draft, pricePerDay: 0 }).ok).toBe(false);
  });
});

describe("updateCar", () => {
  it("edits an owned listing and sends it back for review", () => {
    signInWithEmail("marta@example.com");
    const result = updateCar("car_01", { ...draft, pricePerDay: 2600 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.id).toBe("car_01");
    expect(result.data.pricePerDay).toBe(2600);
    expect(result.data.status).toBe("pending");
  });

  it("refuses another owner's car and an unknown car", () => {
    signInWithEmail("marta@example.com");
    expect(updateCar("car_04", draft).ok).toBe(false);
    expect(updateCar("car_missing", draft).ok).toBe(false);
  });

  it("keeps an inactive listing inactive after an edit", () => {
    signInWithEmail("marta@example.com");
    const result = updateCar("car_08", draft);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("inactive");
  });
});

describe("setCarPublished", () => {
  it("pauses and republishes an approved listing", () => {
    signInWithEmail("marta@example.com");

    const paused = setCarPublished("car_01", false);
    expect(paused.ok).toBe(true);
    if (!paused.ok) return;
    expect(paused.data.status).toBe("inactive");

    const live = setCarPublished("car_01", true);
    expect(live.ok).toBe(true);
    if (!live.ok) return;
    expect(live.data.status).toBe("approved");
  });

  it("refuses to publish an unapproved listing", () => {
    signInWithEmail("marta@example.com");
    expect(setCarPublished("car_06", true).ok).toBe(false);
  });
});

describe("moderateCar", () => {
  it("lets an admin approve and reject a submitted listing", () => {
    signInWithEmail("selam@example.com");

    const approved = moderateCar("car_06", "approve");
    expect(approved.ok).toBe(true);
    if (!approved.ok) return;
    expect(approved.data.status).toBe("approved");

    const rejected = moderateCar("car_07", "reject");
    expect(rejected.ok).toBe(true);
    if (!rejected.ok) return;
    expect(rejected.data.status).toBe("rejected");
  });

  it("refuses an owner who is not an admin", () => {
    signInWithEmail("marta@example.com");
    expect(moderateCar("car_06", "approve").ok).toBe(false);
  });

  it("refuses to review a listing that is already live", () => {
    signInWithEmail("selam@example.com");
    expect(moderateCar("car_01", "reject").ok).toBe(false);
  });
});

describe("toggleUnavailableDate", () => {
  const future = (days: number): string =>
    new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

  it("blocks and unblocks a free night for the owner", () => {
    signInWithEmail("marta@example.com");
    const date = future(180);

    const blocked = toggleUnavailableDate("car_01", date);
    expect(blocked.ok).toBe(true);
    if (!blocked.ok) return;
    expect(blocked.data.unavailableDates).toContain(date);

    const unblocked = toggleUnavailableDate("car_01", date);
    expect(unblocked.ok).toBe(true);
    if (!unblocked.ok) return;
    expect(unblocked.data.unavailableDates).not.toContain(date);
  });

  it("refuses a night that an active booking already holds", () => {
    const booking = listBookings().find(
      (entry) => entry.carId === "car_03" && entry.status === "confirmed",
    );
    expect(booking).toBeDefined();
    if (!booking) return;

    signInWithEmail("marta@example.com");
    const result = toggleUnavailableDate("car_03", booking.startDate);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/already booked/i);
  });

  it("refuses another owner's car, a past date and a broken date", () => {
    signInWithEmail("marta@example.com");
    expect(toggleUnavailableDate("car_05", future(30)).ok).toBe(false);
    expect(toggleUnavailableDate("car_01", "2020-01-01").ok).toBe(false);
    expect(toggleUnavailableDate("car_01", "not-a-date").ok).toBe(false);
  });
});
