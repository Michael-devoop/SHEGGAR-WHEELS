import { describe, expect, it } from "vitest";

import {
  carPath,
  carSlug,
  findCarBySlug,
  slugify,
  uniqueCarSlug,
} from "@/lib/domain/carSlug";
import type { Car } from "@/types";

function makeCar(overrides: Partial<Car> = {}): Car {
  return {
    id: "car_01",
    ownerId: "usr_01",
    make: "Toyota",
    model: "Corolla",
    year: 2019,
    transmission: "automatic",
    seats: 5,
    city: "Addis Ababa",
    neighbourhood: "Bole",
    latitude: 9.0192,
    longitude: 38.7525,
    pricePerDay: 2400,
    photos: ["/images/cars/car-01.jpg"],
    description: "A well-kept Corolla.",
    status: "approved",
    unavailableDates: [],
    createdAt: "2026-01-10T09:00:00.000Z",
    ...overrides,
  };
}

describe("slugify", () => {
  it("lowercases and replaces punctuation with single hyphens", () => {
    expect(slugify("  Toyota  Corolla / 2019  ")).toBe("toyota-corolla-2019");
  });

  it("strips diacritics", () => {
    expect(slugify("Citroën C4")).toBe("citroen-c4");
  });
});

describe("carSlug", () => {
  it("uses the car's real name, year and neighbourhood", () => {
    expect(carSlug(makeCar())).toBe("toyota-corolla-2019-bole");
  });

  it("disambiguates identical models by neighbourhood", () => {
    expect(carSlug(makeCar({ id: "car_06", neighbourhood: "CMC" }))).toBe(
      "toyota-corolla-2019-cmc",
    );
  });

  it("falls back to the id when the name has no usable characters", () => {
    expect(carSlug(makeCar({ make: "!!!", model: "???" }))).toBe("car_01");
  });

  it("uses a stored slug when the listing already has one", () => {
    expect(carSlug(makeCar({ slug: "corolla-bole-2" }))).toBe("corolla-bole-2");
  });
});

describe("uniqueCarSlug", () => {
  it("keeps the readable slug when no other listing owns it", () => {
    expect(
      uniqueCarSlug(makeCar(), [
        makeCar({ id: "car_02", neighbourhood: "CMC" }),
      ]),
    ).toBe("toyota-corolla-2019-bole");
  });

  it("suffixes an identical model, year and neighbourhood", () => {
    const first = makeCar();
    const second = makeCar({ id: "car_10" });

    expect(uniqueCarSlug(second, [first, second])).toBe(
      "toyota-corolla-2019-bole-2",
    );
  });

  it("keeps incrementing until the slug is free", () => {
    const cars = [
      makeCar(),
      makeCar({ id: "car_10", slug: "toyota-corolla-2019-bole-2" }),
      makeCar({ id: "car_11" }),
    ];

    expect(uniqueCarSlug(cars[2], cars)).toBe(
      "toyota-corolla-2019-bole-3",
    );
  });

  it("keeps an assigned suffix when editing the same listing", () => {
    const car = makeCar({ slug: "toyota-corolla-2019-bole-2" });

    expect(uniqueCarSlug(car, [car])).toBe("toyota-corolla-2019-bole-2");
  });

  it("keeps an assigned suffix when the base listing is gone", () => {
    const car = makeCar({ id: "car_10", slug: "toyota-corolla-2019-bole-2" });

    expect(uniqueCarSlug(car, [car])).toBe("toyota-corolla-2019-bole-2");
  });
});

describe("carPath", () => {
  it("returns the public detail path", () => {
    expect(carPath(makeCar())).toBe("/cars/toyota-corolla-2019-bole");
  });
});

describe("findCarBySlug", () => {
  const cars = [
    makeCar(),
    makeCar({ id: "car_06", neighbourhood: "CMC" }),
  ];

  it("finds a car by its readable slug", () => {
    expect(findCarBySlug(cars, "toyota-corolla-2019-cmc")?.id).toBe("car_06");
  });

  it("keeps old id links working", () => {
    expect(findCarBySlug(cars, "car_01")?.id).toBe("car_01");
  });

  it("normalizes legacy id links", () => {
    expect(findCarBySlug(cars, " CAR_01 ")?.id).toBe("car_01");
  });

  it("finds a listing with a collision suffix", () => {
    const carsWithSuffix = [
      makeCar(),
      makeCar({ id: "car_10", slug: "toyota-corolla-2019-bole-2" }),
    ];

    expect(
      findCarBySlug(carsWithSuffix, "toyota-corolla-2019-bole-2")?.id,
    ).toBe("car_10");
  });

  it("returns null for an unknown value", () => {
    expect(findCarBySlug(cars, "not-a-car")).toBeNull();
  });
});
