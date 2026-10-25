# Product Strategy

## Problem

Car ownership in Addis Ababa is expensive and often underused. Renters face opaque pricing, informal agreements, and little recourse when a car is not as described. Owners with idle vehicles lack a trusted way to reach renters, set availability, and manage requests.

Sheggar Wheels is a marketplace concept that makes the exchange legible:

- Renters see approved listings, daily prices, availability, reviews, and a clear request flow.
- Owners get a workspace for listings, requests, calendars, earnings, and reviews.
- Admins act as the trust layer for approvals, disputes, and account safety.

## Users

### Renter

Needs a car for a weekend, a work trip, or a family errand. Cares about price, neighbourhood, transmission, availability, and whether the owner is responsive. Wants to know what happens if something goes wrong.

Primary job: “Find a car that is free when I need it, at a price I understand, and book it without a phone call.”

### Owner

Has a car that sits idle during the week. Cares about utilization, control over dates, predictable fees, and protection from unreliable renters.

Primary job: “Turn my idle car into income without losing control of when it is available.”

### Admin

Needs to keep the marketplace trustworthy without manually reading every record.

Primary job: “Approve good listings, stop bad actors, and resolve disputes with enough context to act.”

## Value proposition

For renters: **a clearer, safer way to borrow a nearby car.**

For owners: **a lightweight way to earn from an asset they already own.**

For the marketplace: **trust operations are first-class**, not an afterthought. Listings are approved, bookings have an explicit lifecycle, disputes have a resolution path, and accounts can be suspended.

## Positioning

Sheggar Wheels is not a general classifieds board. It is a managed peer-to-peer rental flow:

- Structured listing data and moderation.
- Date-aware availability instead of “message me.”
- A booking state machine with role-specific actions.
- Reviews tied to completed rentals.
- Admin dispute resolution and announcements.

The demo proves the product logic and interface. It does not yet prove liquidity, payments, insurance, or identity.

## Priorities

1. **Trust before growth.** Approval, account status, reviews, and dispute handling come before more listings.
2. **Availability is the core query.** A renter should be able to search by dates and see only cars that are actually free.
3. **Keep both sides active.** Owners need a reason to return after publishing; requests, earnings, and reviews provide that loop.
4. **Make admin work efficient.** Moderation queues, user context, and dispute detail should support fast decisions.
5. **Design for a real backend.** The demo keeps data access behind modules so production can replace storage without reworking screens.

## Success measures

For a production pilot, track:

| Area | Measure |
| --- | --- |
| Demand | Searches with dates, car detail views, checkout starts |
| Supply | Approved listings, active owners, calendar completeness |
| Conversion | Request-to-accept rate, accept-to-complete rate |
| Trust | Dispute rate per completed booking, review rate, suspension rate |
| Operations | Time to moderate a listing, time to resolve a dispute |
| Retention | Repeat renter rate, repeat owner rate |

For the demo itself, the success measures are different: all core role flows work, domain rules are tested, and the app builds cleanly.

## Tradeoffs

- **Depth over breadth.** The build covers the full rental lifecycle rather than adding chat, maps, or social features.
- **Local-first over infrastructure.** Browser storage keeps the demo self-contained; it is not a production data strategy.
- **Trust operations visible.** Admin screens are intentionally part of the product, not hidden scaffolding.
- **Portfolio clarity over fake scale.** The documentation describes what is built and what is not.

## Non-goals for this version

- Real payments or payouts.
- Identity verification, driving-licence checks, or insurance.
- Messaging between renters and owners.
- Native mobile apps.
- Multi-city expansion.
- Dynamic pricing or demand forecasting.
