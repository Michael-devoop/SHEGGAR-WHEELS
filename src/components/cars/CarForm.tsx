"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createCar, updateCar } from "@/lib/actions/carActions";
import { NEIGHBOURHOODS, TRANSMISSIONS } from "@/lib/constants";
import type { Car, CarDraft, Transmission } from "@/types";

type Neighbourhood = (typeof NEIGHBOURHOODS)[number];

interface FormState {
  make: string;
  model: string;
  year: string;
  transmission: Transmission;
  seats: string;
  neighbourhood: Neighbourhood;
  pricePerDay: string;
  description: string;
}

const fromCar = (car?: Car): FormState => ({
  make: car?.make ?? "",
  model: car?.model ?? "",
  year: car ? String(car.year) : "",
  transmission: car?.transmission ?? "automatic",
  seats: car ? String(car.seats) : "5",
  neighbourhood: (car?.neighbourhood as Neighbourhood) ?? "Bole",
  pricePerDay: car ? String(car.pricePerDay) : "",
  description: car?.description ?? "",
});

const inputClass =
  "min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30";

/**
 * Owner listing form.
 *
 * The action re-validates every field, so the form can stay a thin shell.
 * Saving an edit to a live listing sends it back to the admin queue.
 */
export default function CarForm({ car }: { car?: Car }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => fromCar(car));
  const [error, setError] = useState<string | null>(null);

  const editing = car !== undefined;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const draft: CarDraft = {
      make: form.make,
      model: form.model,
      year: Number(form.year),
      transmission: form.transmission,
      seats: Number(form.seats),
      neighbourhood: form.neighbourhood,
      pricePerDay: Number(form.pricePerDay),
      description: form.description,
    };

    const result = editing ? updateCar(car.id, draft) : createCar(draft);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push("/owner/cars");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="make" className="text-sm font-medium text-ink">
            Make
          </label>
          <input
            id="make"
            name="make"
            required
            value={form.make}
            onChange={(event) => update("make", event.target.value)}
            className={inputClass}
            placeholder="Toyota"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="model" className="text-sm font-medium text-ink">
            Model
          </label>
          <input
            id="model"
            name="model"
            required
            value={form.model}
            onChange={(event) => update("model", event.target.value)}
            className={inputClass}
            placeholder="Corolla"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="year" className="text-sm font-medium text-ink">
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            inputMode="numeric"
            min={1950}
            max={2100}
            required
            value={form.year}
            onChange={(event) => update("year", event.target.value)}
            className={inputClass}
            placeholder="2019"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="transmission"
            className="text-sm font-medium text-ink"
          >
            Transmission
          </label>
          <select
            id="transmission"
            name="transmission"
            value={form.transmission}
            onChange={(event) =>
              update("transmission", event.target.value as Transmission)
            }
            className={inputClass}
          >
            {TRANSMISSIONS.map((option) => (
              <option key={option} value={option}>
                {option === "automatic" ? "Automatic" : "Manual"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="seats" className="text-sm font-medium text-ink">
            Seats
          </label>
          <input
            id="seats"
            name="seats"
            type="number"
            inputMode="numeric"
            min={1}
            max={12}
            required
            value={form.seats}
            onChange={(event) => update("seats", event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="neighbourhood"
            className="text-sm font-medium text-ink"
          >
            Neighbourhood
          </label>
          <select
            id="neighbourhood"
            name="neighbourhood"
            value={form.neighbourhood}
            onChange={(event) =>
              update("neighbourhood", event.target.value as Neighbourhood)
            }
            className={inputClass}
          >
            {NEIGHBOURHOODS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor="pricePerDay"
            className="text-sm font-medium text-ink"
          >
            Price per day (birr)
          </label>
          <input
            id="pricePerDay"
            name="pricePerDay"
            type="number"
            inputMode="numeric"
            min={100}
            step={50}
            required
            value={form.pricePerDay}
            onChange={(event) => update("pricePerDay", event.target.value)}
            className={inputClass}
            placeholder="1800"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-ink"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            className={`${inputClass} py-2`}
            placeholder="Condition, what the car is good for, and anything a renter should know."
          />
          <p className="text-xs text-ink-muted">
            At least 20 characters. The demo uses one placeholder photo for
            every listing.
          </p>
        </div>
      </div>

      {editing ? (
        <p className="mt-4 rounded-md bg-surface-2 px-3 py-2 text-sm text-ink-muted">
          Saving changes sends this listing back for admin review.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          {editing ? "Save changes" : "Submit for review"}
        </button>
        <Link
          href="/owner/cars"
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
