import type { Metadata } from "next";

import StoredCarDetail from "@/components/cars/StoredCarDetail";
import { getCarById, listCars } from "@/lib/data/cars";
import { listReviewsForCar } from "@/lib/data/reviews";
import { parseCatalogueDateRange } from "@/lib/domain/catalogue";

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

export default async function CarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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
