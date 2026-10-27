# Data Model and Fetching

## Storage model

The demo has no server data source. It uses two browser stores behind a small safe-storage wrapper:

| Store | Lifetime | Used for |
| --- | --- | --- |
| `localStorage` | Until cleared | Users, cars, bookings, reviews, disputes, announcements |
| `sessionStorage` | Until the tab closes | Signed-in session and checkout draft |

Storage keys are centralized in `src/lib/constants.ts` and versioned with a `_v1` suffix. Bump a key when its shape changes in a breaking way.

| Key | Collection |
| --- | --- |
| `sw_users_v1` | Users and roles |
| `sw_cars_v1` | Listings and availability |
| `sw_bookings_v1` | Rental lifecycle and payment state |
| `sw_reviews_v1` | Reviews and owner replies |
| `sw_disputes_v1` | Reports and resolutions |
| `sw_announcements_v1` | Admin announcements |
| `sw_session_v1` | Session (sessionStorage) |
| `sw_checkout_draft_v1` | In-progress checkout (sessionStorage) |

## Seed fallback

`src/data/seed/index.ts` builds a date-relative demo dataset at runtime, so bookings remain sensible whenever the project is opened.

`ensureSeeded` in `src/lib/storage/init.ts`:

- Checks each collection independently.
- Writes seed data only when the stored value is missing or fails its Zod schema.
- Leaves valid stored collections untouched.
- Restores a single collection when only that key is cleared.

Every read in `src/lib/data` follows the same rule: use a valid stored collection if present, otherwise fall back to seed data. This means the public catalogue still renders on the server before the browser store is available.

`resetDemoData` overwrites every collection with a fresh seed set. It is the explicit reset path, not an automatic repair.

## Read path

```text
Server Component or Client Component
        │
        ▼
src/lib/data/*.ts          typed reads + seed fallback
        │
        ▼
src/lib/storage/storage.ts safe parse, shape guard, subscription
        │
        ▼
localStorage / sessionStorage
```

- Reads never throw. A missing key, malformed JSON, blocked storage, or schema mismatch returns the fallback.
- Writes return `boolean` success. Quota errors and private-mode failures are handled.
- Server reads return fallbacks and server writes are no-ops.
- `subscribe` reports updates in the same tab and across tabs.

## Reactive reads

Interactive screens use TanStack Query through hooks in `src/hooks`:

- `useCars`, `useBookings`, `useReviews`, `useDisputes`, `useUsers`, and `useAnnouncements` read through `useCollectionQuery`.
- Each collection has a stable key in `src/lib/queryKeys.ts`.
- `useStorageSync`, mounted inside `src/app/providers.tsx`, invalidates the matching query immediately after a storage write.
- Collection queries poll every 15 seconds as a fallback for changes that arrive without a subscription event. Polling pauses while the tab is hidden but refreshes when it regains focus.
- Queries use `networkMode: "always"` because localStorage reads work offline.

The public catalogue follows a hybrid pattern:

1. The server passes seeded approved cars and bookings to `CatalogueResults` and `StoredCarDetail`.
2. The client uses `useSyncExternalStore` with those server values as its initial snapshot.
3. Date availability, owner edits, and admin approvals therefore appear without a rebuild.

`useSyncExternalStore` remains the right tool for session state and the public catalogue's server-seeded hydration path. The query cache is in memory only; a reload starts from storage again.

## Write path

```text
Form or button
      │
      ▼
src/lib/actions/*.ts
  validate input with Zod
  read current records
  check session, role, ownership, status
  apply pure domain rules
  write the new collection
      │
      ▼
Result<T> → success navigates / failure shows a message
```

Actions never throw expected validation failures. That gives every form one error path and keeps user-facing text out of raw exceptions.

| Action module | Writes |
| --- | --- |
| `authActions.ts` | Users and session |
| `carActions.ts` | Listings, photos, moderation status, availability |
| `bookingActions.ts` | Booking requests and lifecycle transitions |
| `reviewActions.ts` | Reviews and owner replies |
| `disputeActions.ts` | Disputes and admin resolutions |
| `adminActions.ts` | User suspension, listing moderation, reset |
| `announcementActions.ts` | Announcements |

## Validation

Zod schemas in `src/lib/schemas.ts` are the single source of entity and draft shapes. Types in `src/types/index.ts` are inferred from those schemas.

Validation happens in three places:

1. Form-level checks for immediate feedback.
2. Action-level schema parsing before any write.
3. Storage-level guards when reading a collection.

Domain invariants that are not expressible in a schema live in `src/lib/domain`: booking transitions, availability conflicts, pricing, and permissions.

## Consistency and limitations

- Each collection is one JSON value. A write replaces the whole collection.
- There are no transactions across collections.
- Two tabs can race on the same record; the last write wins.
- All records are loaded and serialized in memory. This is fine for the demo's small dataset but not for production volume.
- Clearing site storage destroys local changes and restores the seed data on the next load.

Production should replace this layer with a database, server-validated mutations, and cache invalidation. The UI boundary is already separated: components call `src/lib/data` and `src/lib/actions`, not storage directly.
