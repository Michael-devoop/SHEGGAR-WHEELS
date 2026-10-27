import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import StoredCarDetail from "@/components/cars/StoredCarDetail";
import CarJsonLd from "@/components/seo/CarJsonLd";
import { getCarBySlug, listCarsByStatus } from "@/lib/data/cars";
import { listReviewsForCar } from "@/lib/data/reviews";
import { carPath, carSlug } from "@/lib/domain/carSlug";
import { parseCatalogueDateRange } from "@/lib/domain/catalogue";
import { absoluteUrl, SITE_LOCALE, SITE_NAME } from "@/lib/seo/site";

type CarPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return listCarsByStatus("approved").map((car) => ({ slug: carSlug(car) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const car = getCarBySlug(slug);

  if (car && car.status !== "approved") notFound();

  if (!car) {
    // Browser-created listings are not visible to the server. Stay noindex
    // and let the client resolve them after hydration.
    return {
      title: "Car details",
      robots: { index: false, follow: false },
    };
  }

  const title = `${car.make} ${car.model} in ${car.neighbourhood}`;
  const path = carPath(car);
  const images = car.photos.map((photo) => ({
    url: absoluteUrl(photo),
    width: 1200,
    height: 900,
    alt: `${car.make} ${car.model} ${car.year}`,
  }));

  return {
    title,
    description: car.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      url: path,
      title: `${title} | ${SITE_NAME}`,
      description: car.description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description: car.description,
      images,
    },
  };
}

function CarDetailLoading() {
  return (
    <div
      className="shell py-5 lg:py-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading this car…</span>
      <div className="h-11 w-24 animate-pulse rounded-md bg-surface-2" />
      <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <div className="aspect-[4/3] animate-pulse rounded-lg bg-surface-2" />
        <div className="h-64 animate-pulse rounded-lg bg-surface-2" />
      </div>
    </div>
  );
}

async function CarDetail({ params, searchParams }: CarPageProps) {
  const { slug } = await params;
  const car = getCarBySlug(slug);
  if (car && car.status !== "approved") notFound();

  const reviews = car ? listReviewsForCar(car.id) : [];
  const dates = parseCatalogueDateRange(await searchParams);

  return (
    <>
      {car ? <CarJsonLd car={car} reviews={reviews} /> : null}
      <StoredCarDetail
        carSlug={slug}
        initialCar={car}
        initialReviews={reviews}
        initialStartDate={dates.startDate}
        initialEndDate={dates.endDate}
      />
    </>
  );
}

export default function CarPage(props: CarPageProps) {
  return (
    <Suspense fallback={<CarDetailLoading />}>
      <CarDetail {...props} />
    </Suspense>
  );
}
