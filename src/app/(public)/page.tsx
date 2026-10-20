import Link from "next/link";
import { NEIGHBOURHOODS } from "@/lib/constants";
import { formatETB } from "@/lib/format";

const STEPS = [
  {
    title: "Pick a car",
    body: "Filter by neighbourhood, transmission and daily rate. Every listing shows the real car, the real owner and the real price.",
  },
  {
    title: "Request your dates",
    body: "Choose your dates and send a request. The owner confirms, you pay the amount shown — fee included, nothing added later.",
  },
  {
    title: "Collect and drive",
    body: "Meet the owner, check the car, sign and go. Track the trip and leave a review when you bring it back.",
  },
] as const;

const TRUST = [
  { label: "Verified owners", value: "ID and phone checked" },
  { label: "One price", value: "Fee included upfront" },
  { label: "Local support", value: "Disputes handled in-app" },
] as const;

export default function Home() {
  return (
    <>
      {/* Hero ---------------------------------------------------------- */}
      <section className="on-dark bg-dark text-on-dark">
        <div className="shell flex flex-col gap-6 py-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-on-dark/60">
            Addis Ababa
          </p>

          <div className="flex flex-col gap-4">
            <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Rent a car from someone who actually drives it.
            </h1>
            <p className="max-w-xl text-base text-on-dark/70 sm:text-lg">
              Cars parked in Bole, Piassa and CMC, listed by their owners.
              Booked by the day, priced in birr, with no counter to queue at.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/cars"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-on-dark px-5 text-sm font-semibold text-dark transition-opacity hover:opacity-90"
            >
              Browse cars
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-on-dark/25 px-5 text-sm font-semibold text-on-dark transition-colors hover:bg-on-dark/10"
            >
              List your car
            </Link>
            <p className="text-sm text-on-dark/60">
              From {formatETB(1200)} per day
            </p>
          </div>
        </div>
      </section>

      {/* Neighbourhoods ------------------------------------------------- */}
      <section aria-labelledby="neighbourhoods" className="shell py-10">
        <div className="flex flex-col gap-1">
          <h2 id="neighbourhoods" className="text-xl font-bold tracking-tight">
            Where you want to pick it up
          </h2>
          <p className="text-sm text-ink-muted">
            Start with the neighbourhood that works for you.
          </p>
        </div>

        <ul role="list" className="scroll-row mt-4">
          {NEIGHBOURHOODS.map((area) => (
            <li key={area}>
              <Link
                href={`/cars?neighbourhood=${encodeURIComponent(area)}`}
                className="inline-flex min-h-11 items-center rounded-pill border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-bg"
              >
                {area}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works --------------------------------------------------- */}
      <section aria-labelledby="how-it-works" className="bg-surface">
        <div className="shell py-12">
          <h2 id="how-it-works" className="text-xl font-bold tracking-tight">
            How it works
          </h2>

          <ol role="list" className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2">
                <span
                  aria-hidden="true"
                  className="flex size-8 items-center justify-center rounded-pill bg-primary text-sm font-bold text-on-primary"
                >
                  {index + 1}
                </span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust ---------------------------------------------------------- */}
      <section aria-label="What you get" className="shell py-12">
        <ul role="list" className="grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
          {TRUST.map((item) => (
            <li key={item.label} className="flex flex-col gap-1">
              <span className="text-base font-semibold">{item.label}</span>
              <span className="text-sm text-ink-muted">{item.value}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
