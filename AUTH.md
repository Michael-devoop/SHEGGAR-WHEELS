# Authentication and Authorization

## Important limitation

Sheggar Wheels is a front-end demo. It has **no real authentication**:

- Sign-in accepts any seeded email; there is no password check.
- The session is a `sessionStorage` record containing a user id and timestamp.
- Route guards and action checks run in the browser.
- Browser storage and client code are user-controlled, so none of this is a security boundary.

This is deliberate for a portfolio build. A production release must move identity, authorization, and data access to a server. The migration path is described at the end of this document.

## Roles

A user can hold more than one role. Access is a membership test, never equality.

| Role | Can enter | Main capabilities |
| --- | --- | --- |
| `renter` | `/renter/*` | Request, cancel, start, complete, review, and dispute their own bookings |
| `owner` | `/owner/*` | Manage their own cars, availability, bookings, earnings, reviews, and disputes |
| `admin` | `/admin/*` | Moderate listings, users, bookings, disputes, and announcements |

Suspended accounts keep their data but lose access to every workspace. Admins cannot suspend their own account.

## Enforcement layers

### 1. Group layout guard

Each protected route group wraps its pages in `RoleGuard`:

- `src/app/(renter)/renter/layout.tsx`
- `src/app/(owner)/owner/layout.tsx`
- `src/app/(admin)/admin/layout.tsx`

`RoleGuard` waits for hydration, redirects signed-out visitors to `/signin?next=...`, blocks suspended or missing accounts, and shows an explanation when the user has the wrong role. Signed-out redirects preserve the requested path.

The guard improves navigation and prevents accidental access. It does **not** protect data from a determined user, because all checks and data are in the browser.

### 2. Action-level checks

Every mutation goes through a function in `src/lib/actions`. Actions return `Result<T>` instead of throwing, so the UI has one error path.

Checks include:

- The current session exists and the account is active.
- The account holds the required role.
- The target record exists.
- The caller owns the record, or is an admin, where appropriate.
- The requested booking transition is legal.
- Dates are valid, in the future, and available.
- Prices and platform fees are recalculated on the server-side domain functions before saving.

Examples:

- `bookingActions.ts` rejects self-booking, unavailable dates, and invalid status transitions.
- `carActions.ts` limits owners to their own listings and admins to moderation actions.
- `adminActions.ts` prevents self-suspension and restrict announcement changes to admins.
- `reviewActions.ts` accepts one review per completed booking and only from its renter.
- `disputeActions.ts` lets participants open a dispute and limits resolution to admins.

### 3. Domain rules

Pure functions in `src/lib/domain` define who may do what and when:

- `permissions.ts` — roles, active status, and post-sign-in destination.
- `bookingMachine.ts` — allowed booking transitions and who may trigger them.
- `availability.ts` — unavailable dates, booking conflicts, and date validation.
- `pricing.ts` — rental days, subtotal, platform fee, and total.

Forms use the same functions for previews, and tests exercise the same functions directly. This keeps UI feedback aligned with the action result.

### 4. Data ownership

The data layer is not a security layer, but reads are scoped where the UI needs it:

- Renters see bookings where they are the renter.
- Owners see bookings and cars where they are the owner.
- Admins see everything.

Because storage is client-side, a user can still edit the raw records. Production must enforce the same ownership rules in the database or API.

## Session lifecycle

- Sign-up creates an active account but does not sign it in.
- Sign-in stores `{ userId, signedInAt }` in `sessionStorage` for the tab.
- Sign-out removes the session key.
- The session is restored on reload in the same tab.
- Closing the tab ends the session; domain data remains in `localStorage`.
- A session pointing at a deleted or suspended account is rejected by the guard.

## Threat model for the demo

| Risk | Demo behavior | Production requirement |
| --- | --- | --- |
| Forged session | A user can write any user id to `sessionStorage` | Signed HttpOnly cookie, server session, CSRF protection |
| Role escalation | Roles are readable and editable in local storage | Server-side roles and database-enforced policies |
| IDOR | Action checks prevent normal UI paths, but raw data is local | Object-level authorization in every API/database query |
| Suspended account | Guard blocks the UI, but local data can be edited | Server rejects tokens for suspended accounts |
| Payment tampering | No payment provider; totals are recalculated from car price | Server-side payment intent and webhook verification |
| Data loss | Clearing site storage resets the demo | Durable database with backups |

## Production migration path

1. Replace demo sign-in with an identity provider or a server-managed credential flow.
2. Issue a signed, HttpOnly, `SameSite=Lax` session cookie and verify it on every server request.
3. Move mutations to Server Actions or route handlers that re-check the session and authorization.
4. Store users, cars, bookings, reviews, disputes, and announcements in a database.
5. Enforce ownership and role rules in database queries or row-level policies.
6. Add payment-provider webhooks, idempotency keys, and an audit log.
7. Add rate limiting, CSRF protection, security headers, and monitoring.
8. Add end-to-end tests covering forged sessions, IDOR, suspended accounts, and payment tampering.

Until those changes exist, treat this project as a UI and domain-logic demonstration, not a secure marketplace.
