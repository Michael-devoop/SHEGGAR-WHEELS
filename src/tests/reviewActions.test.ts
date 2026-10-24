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

const { createReview, replyToReview } = await import(
  "@/lib/actions/reviewActions"
);
const { signInWithEmail, signOutAction } = await import(
  "@/lib/actions/authActions"
);
const { getBookingById } = await import("@/lib/data/bookings");
const { getReviewForBooking, listReviewsForCar } = await import(
  "@/lib/data/reviews"
);

beforeEach(() => {
  local.clear();
  session.clear();
});

describe("createReview", () => {
  it("reviews a completed trip and marks the booking reviewed", () => {
    signInWithEmail("yonas@example.com");
    const result = createReview({
      bookingId: "bkg_04",
      rating: 5,
      comment: "Clean car and a smooth handover.",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.carId).toBe("car_02");
    expect(result.data.ownerId).toBe("usr_01");
    expect(result.data.renterId).toBe("usr_02");
    expect(getReviewForBooking("bkg_04")?.rating).toBe(5);
    expect(getBookingById("bkg_04")?.status).toBe("reviewed");
    expect(listReviewsForCar("car_02").some((r) => r.bookingId === "bkg_04")).toBe(
      true,
    );
  });

  it("refuses a second review for the same trip", () => {
    signInWithEmail("yonas@example.com");
    expect(
      createReview({
        bookingId: "bkg_04",
        rating: 4,
        comment: "A perfectly fine car for the city.",
      }).ok,
    ).toBe(true);

    expect(
      createReview({
        bookingId: "bkg_04",
        rating: 3,
        comment: "Trying to review the same trip twice.",
      }).ok,
    ).toBe(false);
  });

  it("refuses a trip that has not completed", () => {
    signInWithEmail("yonas@example.com");
    expect(
      createReview({
        bookingId: "bkg_02",
        rating: 5,
        comment: "Reviewing before the trip has even started.",
      }).ok,
    ).toBe(false);
  });

  it("refuses the owner and a signed-out visitor", () => {
    signInWithEmail("marta@example.com");
    expect(
      createReview({
        bookingId: "bkg_04",
        rating: 5,
        comment: "The owner cannot review their own car.",
      }).ok,
    ).toBe(false);

    signOutAction();
    expect(
      createReview({
        bookingId: "bkg_04",
        rating: 5,
        comment: "A signed-out visitor cannot leave a review.",
      }).ok,
    ).toBe(false);
  });

  it("refuses an invalid rating or comment", () => {
    signInWithEmail("yonas@example.com");
    expect(
      createReview({ bookingId: "bkg_04", rating: 6, comment: "Too many stars." })
        .ok,
    ).toBe(false);
    expect(
      createReview({ bookingId: "bkg_04", rating: 4, comment: "short" }).ok,
    ).toBe(false);
  });
});

describe("replyToReview", () => {
  it("lets the car owner reply once", () => {
    signInWithEmail("yonas@example.com");
    const created = createReview({
      bookingId: "bkg_04",
      rating: 5,
      comment: "Clean car and a smooth handover.",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    signInWithEmail("marta@example.com");
    const reply = replyToReview(created.data.id, "Thank you, see you next time.");

    expect(reply.ok).toBe(true);
    if (!reply.ok) return;
    expect(reply.data.ownerReply).toBe("Thank you, see you next time.");
  });

  it("refuses a renter and another owner", () => {
    signInWithEmail("yonas@example.com");
    const created = createReview({
      bookingId: "bkg_04",
      rating: 5,
      comment: "Clean car and a smooth handover.",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    expect(replyToReview(created.data.id, "Nice try").ok).toBe(false);

    signInWithEmail("selam@example.com");
    expect(replyToReview(created.data.id, "Not my car").ok).toBe(false);
  });
});
