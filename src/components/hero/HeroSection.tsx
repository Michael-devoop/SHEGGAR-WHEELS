"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

/**
 * Lazy-load the canvas so the hero text and gradient are visible immediately
 * even while the 224-frame image set streams in.
 */
const ScrollCarCanvas = dynamic(() => import("./ScrollCarCanvas"), {
  ssr: false,
  loading: () => (
    <div className="hero-scroll-wrapper">
      <div className="hero-scroll-sticky">
        {/* Static placeholder while canvas JS loads */}
        <div
          className="hero-scroll-canvas"
          style={{ background: "var(--gray-950)" }}
        />
      </div>
    </div>
  ),
});

/**
 * Full-screen automotive hero with scroll-controlled BYD animation.
 *
 * Everything (content, overlays, canvas) lives inside the scroll wrapper's
 * sticky container so it all scrolls away naturally when the 300vh track ends.
 * The content comes first in DOM for accessibility and SEO.
 */
export default function HeroSection() {
  return (
    <section
      data-surface="dark"
      className="hero-section -mt-16"
      aria-label="Hero"
    >
      <ScrollCarCanvas>
        {/* ── Gradient overlays (pointer-events-none) ── */}
        <div className="hero-overlay" aria-hidden="true">
          <div className="hero-gradient-top" />
          <div className="hero-gradient-bottom" />
          <div className="hero-gradient-vignette" />
        </div>

        {/* ── Text content (first meaningful paint) ────────────── */}
        <div className="hero-content">
          <div className="hero-content-inner shell">
            {/* Eyebrow */}
            <p className="hero-eyebrow">
              Sheggar Wheels
            </p>

            {/* Headline */}
            <h1 className="hero-headline">
              THE FUTURE<br className="sm:hidden" /> OF DRIVING
            </h1>

            {/* Sub-headline */}
            <p className="hero-subheadline">
              Discover a smarter, more sustainable driving experience.
            </p>

            {/* CTAs */}
            <div className="hero-cta-group">
              <Link
                href="/cars"
                className="hero-cta-primary"
              >
                Explore Vehicles
              </Link>
              <Link
                href="/signup"
                className="hero-cta-secondary"
              >
                Discover More
              </Link>
            </div>

            {/* Scroll hint */}
            <div className="hero-scroll-hint" aria-hidden="true">
              <span className="hero-scroll-hint-line" />
              <span className="hero-scroll-hint-label">Scroll to explore</span>
            </div>
          </div>
        </div>
      </ScrollCarCanvas>
    </section>
  );
}

