import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
  imageSrc: string;
  badgeText: string;
  headline: string;
  quote: string;
  author: string;
  perks: string[];
};

export default function AuthShell({
  children,
  imageSrc,
  badgeText,
  headline,
  quote,
  author,
  perks,
}: AuthShellProps) {
  return (
    <div className="min-h-dvh w-full lg:grid lg:grid-cols-12 bg-zinc-50">
      {/* Form Column */}
      <main className="flex min-h-dvh flex-col justify-between p-6 sm:p-10 lg:col-span-6 xl:col-span-5 lg:p-12 xl:p-16">
        {/* Top bar with Logo & Back button */}
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2 transition-opacity hover:opacity-85"
            aria-label="Sheggar Wheels Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sheggar-wheels-logo.webp"
              alt="Sheggar Wheels"
              className="h-11 w-auto object-contain sm:h-12"
              style={{ filter: "brightness(0)" }}
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-600 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to site</span>
          </Link>
        </header>

        {/* Mobile car preview card */}
        <div className="relative mt-6 h-36 w-full overflow-hidden rounded-2xl shadow-sm lg:hidden">
          <Image
            src={imageSrc}
            alt="Sheggar Wheels vehicle"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-300">
              {badgeText}
            </span>
            <p className="text-sm font-bold text-white line-clamp-1">
              {headline}
            </p>
          </div>
        </div>

        {/* Center: The Form Container (Form is rendered untouched) */}
        <div className="my-auto py-8 sm:py-10">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-zinc-100 bg-white p-7 sm:p-9 shadow-sm sm:shadow-md">
            {children}
          </div>
        </div>

        {/* Footer info */}
        <footer className="flex flex-wrap items-center justify-between gap-3 pt-6 text-xs text-zinc-400">
          <p>© 2026 Sheggar Wheels. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/cars" className="transition-colors hover:text-zinc-700">
              Browse cars
            </Link>
            <Link href="/" className="transition-colors hover:text-zinc-700">
              Support
            </Link>
          </div>
        </footer>
      </main>

      {/* Side Car Image Column (Desktop) */}
      <aside
        aria-hidden="true"
        className="relative hidden lg:col-span-6 xl:col-span-7 lg:flex lg:flex-col lg:justify-between overflow-hidden bg-zinc-950 p-10 xl:p-14"
      >
        {/* Background Car Image */}
        <Image
          src={imageSrc}
          alt="Sheggar Wheels Fleet"
          fill
          sizes="(min-width: 1280px) 58vw, 50vw"
          priority
          className="object-cover object-center transition-transform duration-1000 ease-out hover:scale-105"
        />

        {/* Cinematic Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/30 via-transparent to-transparent" />

        {/* Top Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {badgeText}
          </span>

          <div className="flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold">4.9</span>
            <span className="text-white/60">(500+ reviews)</span>
          </div>
        </div>

        {/* Bottom Glassmorphism Card */}
        <div className="relative z-10 max-w-xl space-y-5 rounded-3xl border border-white/15 bg-white/10 p-7 xl:p-8 text-white backdrop-blur-xl shadow-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-white xl:text-3xl">
            {headline}
          </h2>

          <p className="text-sm leading-relaxed text-zinc-200 xl:text-base">
            &ldquo;{quote}&rdquo;
          </p>

          <p className="text-xs font-semibold text-zinc-300">
            — {author}
          </p>

          {/* Perks list */}
          <div className="grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-3 border-t border-white/10 text-xs">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-1.5 text-zinc-200">
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
