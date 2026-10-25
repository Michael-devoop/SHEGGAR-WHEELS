import { describe, expect, it } from "vitest";

import { PAGE_SIZE } from "@/lib/constants";
import {
  parseCatalogueQuery,
  searchCars,
  type CatalogueQuery,
} from "@/lib/domain/catalogue";
import type { Booking, Car, CarStatus } from "@/types";

function makeCar(overrides: Partial<Car> = {}): Car {
  return {
    id: "car_test",
    ownerId: "usr_owner",
    make: "Toyota",
    model: "Corolla",
    year: 2019,
    transmission: "automatic",
    seats: 5,
    city: "Addis Ababa",
    neighbourhood: "Bole",
    latitude: 9.0192,
    longitude: 38.7525,
    pricePerDay: 1500,
    photos: ["/images/cars/placeholder.svg"],
    description: "Clean and reliable",
    status: "approved",
    unavailableDates: [],
    createdAt: "2026-01-01T09:00:00.000Z",
    ...overrides,
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "bkg_test",
    carId: "car_test",
    renterId: "usr_renter",
    ownerId: "usr_owner",
    startDate: "2026-11-20",
    endDate: "2026-11-22",
    days: 2,
    pricePerDay: 1500,
    subtotal: 3000,
    fee: 300,
    total: 3300,
    paymentStatus: "held",
    status: "confirmed",
    createdAt: "2026-11-01T09:00:00.000Z",
    updatedAt: "2026-11-01T09:00:00.000Z",
    ...overrides,
  };
}

const query = (overrides: Partial<CatalogueQuery> = {}): CatalogueQuery => ({
  q: "",
  neighbourhood: "",
  transmission: "",
  maxPrice: null,
  startDate: "",
  endDate: "",
  sort: "newest",
  page: 1,
  ...overrides,
});

describe("parseCatalogueQuery", () => {
  it("defaults to the first page of everything", () => {
    expect(parseCatalogueQuery({})).toEqual(query());
  });

  it("keeps the values it understands", () => {
    expect(
      parseCatalogueQuery({
        q: "  corolla ",
        neighbourhood: "Bole",
        transmission: "manual",
        maxPrice: "1800",
        sort: "price-asc",
        page: "2",
      }),
    ).toEqual(
      query({
        q: "corolla",
        neighbourhood: "Bole",
        transmission: "manual",
        maxPrice: 1800,
        sort: "price-asc",
        page: 2,
      }),
    );
  });

  it("uses the first value when a parameter repeats", () => {
    expect(
      parseCatalogueQuery({ neighbourhood: ["CMC", "Bole"] }).neighbourhood,
    ).toBe("CMC");
  });

  it("drops values it does not understand", () => {
    const parsed = parseCatalogueQuery({
      neighbourhood: "Atlantis",
      transmission: "rocket",
      maxPrice: "-3",
      sort: "cheapest",
      page: "0",
    });

    expect(parsed).toEqual(query());
  });

  it("keeps a complete, valid date range", () => {
    expect(
      parseCatalogueQuery({ startDate: "2026-11-20", endDate: "2026-11-22" }),
    ).toEqual(query({ startDate: "2026-11-20", endDate: "2026-11-22" }));
  });

  it("drops incomplete, impossible or reversed dates", () => {
    expect(parseCatalogueQuery({ startDate: "2026-11-20" })).toEqual(query());
    expect(parseCatalogueQuery({ endDate: "2026-11-22" })).toEqual(query());
    expect(
      parseCatalogueQuery({ startDate: "2026-02-30", endDate: "2026-03-02" }),
    ).toEqual(query());
    expect(
      parseCatalogueQuery({ startDate: "2026-11-22", endDate: "2026-11-20" }),
    ).toEqual(query());
  });
});

describe("searchCars", () => {
  it("only shows approved listings", () => {
    const statuses: CarStatus[] = [
      "draft",
      "pending",
      "rejected",
      "inactive",
    ];
    const cars = statuses.map((status) =>
      makeCar({ id: `car_${status}`, status }),
    );

    expect(searchCars(cars, query()).total).toBe(0);
  });

  it("matches make, model and description, ignoring case", () => {
    const cars = [
      makeCar({ id: "car_1", model: "Corolla" }),
      makeCar({ id: "car_2", make: "Hyundai", model: "Accent" }),
      makeCar({
        id: "car_3",
        make: "Mazda",
        model: "Demio",
        description: "Sunroof and leather seats",
      }),
    ];

    expect(searchCars(cars, query({ q: "COROLLA" })).cars.map((c) => c.id)).toEqual(["car_1"]);
    expect(searchCars(cars, query({ q: "sunroof" })).cars.map((c) => c.id)).toEqual(["car_3"]);
    expect(searchCars(cars, query({ q: "hyundai" })).cars.map((c) => c.id)).toEqual(["car_2"]);
  });

  it("filters by neighbourhood and transmission", () => {
    const cars = [
      makeCar({ id: "car_bole", neighbourhood: "Bole", transmission: "automatic" }),
      makeCar({ id: "car_cmc", neighbourhood: "CMC", transmission: "manual" }),
    ];

    expect(
      searchCars(cars, query({ neighbourhood: "CMC" })).cars.map((c) => c.id),
    ).toEqual(["car_cmc"]);
    expect(
      searchCars(cars, query({ transmission: "automatic" })).cars.map((c) => c.id),
    ).toEqual(["car_bole"]);
  });

  it("applies the maximum price inclusively", () => {
    const cars = [
      makeCar({ id: "car_1200", pricePerDay: 1200, createdAt: "2026-01-01T09:00:00.000Z" }),
      makeCar({ id: "car_1500", pricePerDay: 1500, createdAt: "2026-02-01T09:00:00.000Z" }),
      makeCar({ id: "car_2000", pricePerDay: 2000, createdAt: "2026-03-01T09:00:00.000Z" }),
    ];

    expect(
      searchCars(cars, query({ maxPrice: 1500 })).cars.map((c) => c.id),
    ).toEqual(["car_1500", "car_1200"]);
  });

  it("sorts by price and by newest", () => {
    const cars = [
      makeCar({ id: "car_old_cheap", pricePerDay: 1000, createdAt: "2026-01-01T09:00:00.000Z" }),
      makeCar({ id: "car_new_dear", pricePerDay: 2500, createdAt: "2026-03-01T09:00:00.000Z" }),
      makeCar({ id: "car_mid", pricePerDay: 1500, createdAt: "2026-02-01T09:00:00.000Z" }),
    ];

    expect(searchCars(cars, query({ sort: "price-asc" })).cars.map((c) => c.id)).toEqual([
      "car_old_cheap",
      "car_mid",
      "car_new_dear",
    ]);
    expect(searchCars(cars, query({ sort: "price-desc" })).cars.map((c) => c.id)).toEqual([
      "car_new_dear",
      "car_mid",
      "car_old_cheap",
    ]);
    expect(searchCars(cars, query({ sort: "newest" })).cars.map((c) => c.id)).toEqual([
      "car_new_dear",
      "car_mid",
      "car_old_cheap",
    ]);
  });

  it("only shows cars free for the requested dates", () => {
    const cars = [
      makeCar({ id: "car_free" }),
      makeCar({ id: "car_booked" }),
      makeCar({
        id: "car_blocked",
        unavailableDates: ["2026-11-21"],
      }),
    ];
    const bookings = [makeBooking({ carId: "car_booked" })];

    expect(
      searchCars(
        cars,
        query({ startDate: "2026-11-20", endDate: "2026-11-22" }),
        bookings,
      ).cars.map((car) => car.id),
    ).toEqual(["car_free"]);
  });

  it("does not filter by dates when the range is absent", () => {
    const cars = [makeCar({ id: "car_free" }), makeCar({ id: "car_booked" })];
    const bookings = [makeBooking({ carId: "car_booked" })];

    expect(searchCars(cars, query(), bookings).total).toBe(2);
  });

  it("ignores cancelled bookings when filtering by dates", () => {
    const cars = [makeCar({ id: "car_free" })];
    const bookings = [
      makeBooking({ carId: "car_free", status: "cancelled" }),
    ];

    expect(
      searchCars(
        cars,
        query({ startDate: "2026-11-20", endDate: "2026-11-22" }),
        bookings,
      ).cars.map((car) => car.id),
    ).toEqual(["car_free"]);
  });

  it("pages through the result and clamps an out-of-range page", () => {
    const cars = Array.from({ length: PAGE_SIZE + 2 }, (_, index) =>
      makeCar({
        id: `car_${String(index).padStart(2, "0")}`,
        createdAt: `2026-01-${String(index + 1).padStart(2, "0")}T09:00:00.000Z`,
      }),
    );

    const first = searchCars(cars, query());
    expect(first.cars).toHaveLength(PAGE_SIZE);
    expect(first.total).toBe(PAGE_SIZE + 2);
    expect(first.pageCount).toBe(2);
    expect(first.hasNext).toBe(true);
    expect(first.hasPrevious).toBe(false);

    const second = searchCars(cars, query({ page: 2 }));
    expect(second.cars).toHaveLength(2);
    expect(second.hasPrevious).toBe(true);
    expect(second.hasNext).toBe(false);

    const clamped = searchCars(cars, query({ page: 99 }));
    expect(clamped.page).toBe(2);
    expect(clamped.cars).toHaveLength(2);
  });

  it("reports one empty page when nothing matches", () => {
    const result = searchCars([], query({ page: 4 }));
    expect(result).toMatchObject({
      total: 0,
      page: 1,
      pageCount: 1,
      hasNext: false,
      hasPrevious: false,
    });
    expect(result.cars).toEqual([]);
  });
});
