import { describe, expect, it } from "vitest";

import {
  absoluteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";
import {
  buildCarStructuredData,
  buildOrganizationStructuredData,
  serializeJsonLd,
} from "@/lib/seo/structured-data";
import type { Car, Review } from "@/types";

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
    description: "A well-kept Corolla with service history.",
    status: "approved",
    unavailableDates: [],
    createdAt: "2026-01-10T09:00:00.000Z",
    ...overrides,
  };
}

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: "rev_01",
    bookingId: "bkg_01",
    carId: "car_01",
    renterId: "usr_02",
    ownerId: "usr_01",
    rating: 5,
    comment: "Great car.",
    createdAt: "2026-02-01T09:00:00.000Z",
    ...overrides,
  };
}

describe("buildCarStructuredData", () => {
  it("describes an approved car with an absolute rental offer", () => {
    const car = makeCar();
    const data = buildCarStructuredData(car, []);

    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Car",
      name: "Toyota Corolla 2019",
      description: car.description,
      url: absoluteUrl("/cars/toyota-corolla-2019-bole"),
      image: [absoluteUrl("/images/cars/car-01.jpg")],
      brand: { "@type": "Brand", name: "Toyota" },
      model: "Corolla",
      vehicleTransmission: "automatic",
      seatingCapacity: 5,
      areaServed: { "@type": "City", name: "Addis Ababa" },
      offers: {
        "@type": "Offer",
        url: absoluteUrl("/cars/toyota-corolla-2019-bole"),
        price: 2400,
        priceCurrency: "ETB",
        availability: "https://schema.org/InStock",
        businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      },
    });
    expect(data).not.toHaveProperty("aggregateRating");
  });

  it("adds an aggregate rating only when reviews exist", () => {
    const data = buildCarStructuredData(makeCar(), [
      makeReview({ id: "rev_01", rating: 5 }),
      makeReview({ id: "rev_02", rating: 4 }),
    ]);

    expect(data.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 2,
      bestRating: 5,
      worstRating: 1,
    });
  });
});

describe("buildOrganizationStructuredData", () => {
  it("identifies the marketplace and its service area", () => {
    expect(buildOrganizationStructuredData()).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      areaServed: { "@type": "City", name: "Addis Ababa" },
    });
  });
});

describe("serializeJsonLd", () => {
  it("escapes markup so a description cannot close the script tag", () => {
    const payload = {
      description: '</script><script>alert("x")</script> & more',
    };

    const serialized = serializeJsonLd(payload);

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script\\u003e");
    expect(JSON.parse(serialized)).toEqual(payload);
  });

  it("escapes line and paragraph separators", () => {
    const serialized = serializeJsonLd({ text: "a\u2028b\u2029c" });

    expect(serialized).toContain("\\u2028");
    expect(serialized).toContain("\\u2029");
  });
});
