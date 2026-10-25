import type { Metadata } from "next";
import { Suspense } from "react";

import StoredCarDetail from "@/components/cars/StoredCarDetail";
import { getCarById, listCars } from "@/lib/data/cars";
import { listReviewsForCar } from "@/lib/data/reviews";
import { parseCatalogueDateRange } from "@/lib/domain/catalogue";

type CarPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return listCars().map((car) => ({ id: car.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = getCarById(id);
  if (!car) return { title: "Car details" };

  return {
    title: `${car.make} ${car.model} in ${car.neighbourhood}`,
    description: car.description,
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
  const { id } = await params;
  const car = getCarById(id);
  const dates = parseCatalogueDateRange(await searchParams);

  return (
    <StoredCarDetail
      carId={id}
      initialCar={car}
      initialReviews={car ? listReviewsForCar(car.id) : []}
      initialStartDate={dates.startDate}
      initialEndDate={dates.endDate}
    />
  );
}

export default function CarPage(props: CarPageProps) {
  return (
    <Suspense fallback={<CarDetailLoading />}>
      <CarDetail {...props} />
    </Suspense>
  );
}
