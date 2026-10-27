"use client";

const BRANDS = [
  { name: "Toyota", logo: "/images/brands/toyota.svg" },
  { name: "Hyundai", logo: "/images/brands/hyundai.svg" },
  { name: "Suzuki", logo: "/images/brands/suzuki.svg" },
  { name: "Nissan", logo: "/images/brands/nissan.svg" },
  { name: "BYD", logo: "/images/brands/byd.svg" },
  { name: "Honda", logo: "/images/brands/honda.svg" },
  { name: "Volkswagen", logo: "/images/brands/volkswagen.svg" },
  { name: "Kia", logo: "/images/brands/kia.svg" },
  { name: "Mitsubishi", logo: "/images/brands/mitsubishi.svg" },
];

/**
 * Infinite-scrolling car brand marquee with brand marks and edge fades.
 * Duplicates the list so it loops seamlessly via CSS animation.
 */
export default function BrandMarquee() {
  return (
    <section
      aria-label="Trusted car brands"
      className="overflow-hidden border-y border-border bg-bg py-8"
    >
      <div className="relative">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--color-bg,#fff)] to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--color-bg,#fff)] to-transparent sm:w-40" />

        {/* Scrolling track */}
        <div className="flex w-max animate-[marquee_30s_linear_infinite] items-center">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              aria-hidden={i >= BRANDS.length ? true : undefined}
              className="mx-6 flex flex-shrink-0 flex-col items-center gap-2 sm:mx-10"
            >
              <div className="flex h-14 w-32 items-center justify-center sm:h-16 sm:w-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt=""
                  className="max-h-10 max-w-28 object-contain opacity-70 transition-opacity duration-300 hover:opacity-100 sm:max-h-12 sm:max-w-36"
                  loading="lazy"
                />
              </div>
              <span className="text-xs font-semibold tracking-wide text-zinc-400 sm:text-sm">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
