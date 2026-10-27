# Sheggar Wheels

A peer-to-peer car rental marketplace for Addis Ababa. Owners list their cars, renters search by trip dates and book them, and administrators moderate listings, accounts, disputes, and announcements.

This is a portfolio capstone built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zod 4, and Vitest.

## Demo scope

This build is intentionally front-end only:

- No backend, database, passwords, or real payments.
- Demo data lives in the browser (`localStorage`) and the session in `sessionStorage`.
- Changes survive refreshes in the same browser. Use the admin data controls or clear site storage to reset the demo.
- Signing in only requires an email from the seeded accounts below.

The data layer is isolated so a real API or database can replace it without rewriting the UI.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional environment variable:

```bash
cp .env.example .env.local
```

`NEXT_PUBLIC_SITE_URL` controls canonical URLs, `robots.txt`, and `sitemap.xml`. It defaults to `http://localhost:3000` in development and to the Vercel production host (`https://sheggar-wheels-liart.vercel.app`) when unset in production.

## Demo accounts

| Role | Name | Email |
| --- | --- | --- |
| Owner + renter | Marta Bekele | `marta@example.com` |
| Renter | Yonas Tadesse | `yonas@example.com` |
| Admin + owner | Selam Girma | `selam@example.com` |
| Suspended renter | Abel Kebede | `abel@example.com` |

Sign-up creates an active account with the roles you choose.

## What you can do

**Renters**

- Browse approved cars and filter by free trip dates, neighbourhood, transmission, and price.
- Request a booking with a live availability and price quote.
- Track a trip, review a completed rental, and open a dispute.

**Owners**

- Create and edit listings, manage photos, and submit them for approval.
- Accept or decline requests, manage availability, and track earnings.
- Reply to reviews and respond to disputes.

**Admins**

- Review marketplace activity and moderate listings.
- Inspect bookings and users, suspend or reactivate accounts.
- Resolve disputes and publish announcements on the public home page.

## Routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/cars`, `/cars/[slug]`, `/signin`, `/signup` |
| Renter | `/renter/dashboard`, `/renter/checkout`, `/renter/bookings`, booking detail, review, tracking |
| Owner | `/owner`, `/owner/cars`, car editor, availability, per-car bookings, `/owner/bookings`, `/owner/earnings`, `/owner/reviews`, `/owner/disputes` |
| Admin | `/admin`, `/admin/listings`, `/admin/bookings`, `/admin/users`, `/admin/disputes`, `/admin/announcements`, `/admin/reports` |

Role guards live in each group layout. See [`AUTH.md`](./AUTH.md) for the exact model and its demo limitations.

## Architecture

```text
src/
  app/              App Router routes, grouped by audience
  components/       Feature UI plus shared design-system primitives
  data/seed/        Date-relative demo dataset
  hooks/            Reactive reads and mutation helpers
  lib/actions/      Validated operations that write through storage
  lib/data/         Typed reads with seed fallback
  lib/domain/       Pure rules: availability, bookings, pricing, permissions
  lib/storage/      Safe localStorage/sessionStorage client
  tests/            Vitest coverage for domain rules and actions
  types/            Types inferred from Zod schemas
```

Key decisions:

- Server Components render public pages by default; client leaves handle storage, forms, and session state.
- Reads go through `lib/data`; every stored collection falls back to seed data when missing or invalid.
- Mutations go through `lib/actions`, which validate role, ownership, state transitions, dates, and prices before writing.
- Domain rules are pure and shared by forms, actions, and tests.
- Collection hooks use TanStack Query with 15-second polling. Storage writes invalidate the matching query immediately, so the UI updates without waiting for the poll.

More detail: [`DATA.md`](./DATA.md), [`BOUNDARY.md`](./BOUNDARY.md), and [`PERF.md`](./PERF.md).

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The suite covers domain rules and action flows. There is no browser-automation suite yet; see [`FUTURE.md`](./FUTURE.md).

## Documentation

- [`AUTH.md`](./AUTH.md) — roles, route guards, action checks, and production gaps.
- [`DATA.md`](./DATA.md) — storage model, seed fallback, read/write paths, and reset behavior.
- [`PERF.md`](./PERF.md) — rendering strategy, verified build status, and performance limits.
- [`STRATEGY.md`](./STRATEGY.md) — users, value proposition, product priorities, and success measures.
- [`FUTURE.md`](./FUTURE.md) — roadmap from demo to production.
- [`BOUNDARY.md`](./BOUNDARY.md) — Server/Client component split.
