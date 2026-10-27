import type { Metadata } from "next";
import Link from "next/link";

import BrandMarquee from "@/components/home/BrandMarquee";
import HeroSection from "@/components/hero/HeroSection";
import { NEIGHBOURHOODS } from "@/lib/constants";
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/seo/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

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
      {/* Hero — scroll-controlled BYD animation ----------------------- */}
      <HeroSection />

      {/* Car brand marquee ──────────────────────────────────────────── */}
      <BrandMarquee />

      {/* Neighbourhoods ------------------------------------------------- */}
      <section
        aria-labelledby="neighbourhoods"
        data-surface="dark"
        className="bg-zinc-950 text-white"
      >
        <div className="shell grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          {/* Left column — headline + CTAs */}
          <div className="flex flex-col gap-6">
            <h2
              id="neighbourhoods"
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            >
              Find Your Ride,
              <br />
              Anywhere in Addis
            </h2>
            <p className="max-w-md text-base leading-relaxed text-zinc-400">
              Browse cars from verified owners across Addis Ababa.
              Pick the neighbourhood closest to you and start driving.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/cars"
                className="inline-flex items-center rounded-lg border border-white bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                BROWSE ALL CARS
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                LIST YOUR CAR
              </Link>
            </div>
          </div>

          {/* Right column — scrolling neighbourhood names */}
          <div className="relative flex flex-col items-start gap-2 overflow-hidden py-4 lg:items-end">
            {/* Top fade */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-zinc-950 to-transparent" />
            {/* Bottom fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-zinc-950 to-transparent" />

            {NEIGHBOURHOODS.map((area, i) => {
              // Middle items are brightest, edges fade
              const mid = (NEIGHBOURHOODS.length - 1) / 2;
              const dist = Math.abs(i - mid) / mid;
              const opacity = Math.max(0.2, 1 - dist * 0.7);

              return (
                <Link
                  key={area}
                  href={`/cars?neighbourhood=${encodeURIComponent(area)}`}
                  className="block text-3xl font-bold tracking-tight transition-opacity duration-300 hover:!opacity-100 sm:text-4xl lg:text-5xl"
                  style={{ opacity }}
                >
                  {area}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works --------------------------------------------------- */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        data-surface="dark"
        className="scroll-mt-24 bg-surface-inverse"
      >
        <div className="shell py-20">
          {/* Header */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ink-muted">
              How it Works
            </p>
            <h2
              id="how-it-works-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              From search to road in three steps
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
              No dealership, no hidden fees, no waiting —
              just peer-to-peer car rental you can trust.
            </p>
          </div>

          {/* Cards */}
          <ol
            role="list"
            className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3"
          >
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="relative flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-md"
              >
                {/* Icon + step number */}
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-surface-2 text-ink-muted">
                    {index === 0 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
                    )}
                    {index === 1 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    )}
                    {index === 2 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                    )}
                  </span>
                  <span className="text-base font-medium text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Text */}
                <h3 className="text-lg font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-base leading-relaxed text-ink-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          {/* CTA */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Get started
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
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
