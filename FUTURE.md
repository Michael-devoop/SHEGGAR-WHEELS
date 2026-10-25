# Roadmap

The current build is a complete front-end demo of the rental lifecycle. The next phase is about turning demo logic into a trustworthy product.

## Phase 1 — Production foundation

- Replace `sessionStorage` sign-in with a real identity provider or server credential flow.
- Move data to PostgreSQL (or another durable store) with migrations.
- Recreate every `src/lib/actions` rule in server actions or API handlers.
- Enforce roles and ownership with database queries or row-level policies.
- Add CSRF protection, rate limiting, security headers, and audit logging.
- Add integration tests for forged sessions, IDOR, suspension, and invalid transitions.

Exit criteria: a user cannot gain another user’s access by editing browser state, and every mutation is authorized on the server.

## Phase 2 — Marketplace operations

- Add listing photo uploads with storage, resizing, and moderation.
- Add a real availability calendar with blocked dates, minimum rental periods, and pickup/return times.
- Add owner and renter messaging with moderation and abuse reporting.
- Add notification preferences for requests, acceptances, reminders, and disputes.
- Add admin audit trails and bulk moderation actions.
- Add exportable reports for bookings, revenue, and disputes.

Exit criteria: an owner can run a listing end to end without leaving the product, and an admin can reconstruct who changed what.

## Phase 3 — Money and trust

- Integrate a payment provider with authorization, capture, refunds, and payouts.
- Hold funds until pickup or completion, then release to the owner.
- Add identity verification and driving-licence checks.
- Define insurance, damage, fuel, mileage, and late-return policies.
- Add deposit handling and damage-claim evidence.
- Add fraud signals for duplicate accounts, chargebacks, and suspicious bookings.

Exit criteria: money movement is server-authoritative, refunds are auditable, and dispute outcomes can trigger payment actions.

## Phase 4 — Discovery and growth

- Add map search with neighbourhood and pickup-point filters.
- Add saved searches, favourites, and price alerts.
- Add availability-aware search ranking.
- Add renter and owner profiles with verified badges.
- Add referral and repeat-renter incentives.
- Add Amharic and English localization.
- Add structured data and richer SEO for approved listings.

Exit criteria: renters can find a suitable car quickly, and repeat usage is measurable.

## Phase 5 — Reliability

- Add Playwright end-to-end coverage for sign-in, catalogue dates, checkout, owner acceptance, tracking, review, dispute, and admin resolution.
- Add visual regression checks for the public catalogue and dashboard shells.
- Add bundle budgets and Web Vitals tracking in CI.
- Add error monitoring and structured server logs.
- Add database backups, restore drills, and incident runbooks.
- Add accessibility audits with keyboard and screen-reader testing.

Exit criteria: critical flows are covered by automated tests, regressions are caught before release, and incidents have a documented response.

## Near-term engineering tasks

1. Add route-level `error.tsx` boundaries for the renter, owner, and admin groups.
2. Add browser tests for date-filtered catalogue links preserving dates into checkout.
3. Add rate limits and idempotency keys around booking creation once a server exists.
4. Add validation for past dates and maximum rental length in the booking form and action.
5. Add a database-backed availability query so date filtering does not depend on browser storage.
6. Replace the demo image placeholders with real uploads and optimized delivery.
7. Add an accessibility pass for table density, focus order, and mobile navigation.
8. Replace the current in-memory collection writes with transactional server mutations.

## Explicitly out of scope for now

- Native iOS or Android apps.
- Real-time GPS tracking of vehicles.
- Dynamic pricing or machine-learned demand forecasts.
- Multi-city or multi-country expansion.
- Social feeds or community features.
