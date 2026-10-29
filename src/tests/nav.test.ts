import { describe, expect, it } from "vitest";

import { activeNavHref, type NavItem } from "@/lib/nav";

const items: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/users", label: "Users" },
];

describe("activeNavHref", () => {
  it("matches the exact route", () => {
    expect(activeNavHref(items, "/admin")).toBe("/admin");
  });

  it("matches a nested route", () => {
    expect(activeNavHref(items, "/admin/listings")).toBe("/admin/listings");
  });

  it("prefers the longest match over the group root", () => {
    expect(activeNavHref(items, "/admin/users/usr_123")).toBe("/admin/users");
  });

  it("returns nothing when no item matches", () => {
    expect(activeNavHref(items, "/renter/bookings")).toBeUndefined();
  });
});
