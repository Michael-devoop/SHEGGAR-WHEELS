import type { Metadata } from "next";

import StoredCarDetail from "@/components/cars/StoredCarDetail";
import { getCarById, listCars } from "@/lib/data/cars";
import { listReviewsForCar } from "@/lib/data/reviews";

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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = getCarById(id);

  return (
    <StoredCarDetail
      carId={id}
      initialCar={car}
      initialReviews={car ? listReviewsForCar(car.id) : []}
    />
  );
}
