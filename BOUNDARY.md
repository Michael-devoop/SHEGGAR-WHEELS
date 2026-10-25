# Server and Client Boundary

## Rule

Render on the server by default. Add `"use client"` only where the browser is required: storage, session state, form events, router navigation, or interactive UI primitives.

Data is fetched through `src/lib/data` on the server where possible, then passed to client leaves as serializable initial state. Client leaves subscribe to browser storage after hydration.

## Boundary map

### Server by default

These areas contain no `"use client"` at the page or container level:

- `src/app/layout.tsx` — root HTML shell and skip link.
- `src/app/(public)/page.tsx` — marketing home page with server-rendered announcements and car data.
- `src/app/(public)/cars/page.tsx` — parses search parameters and passes seed data to filters and results.
- `src/app/(public)/cars/[id]/page.tsx` — static params, metadata, and seed detail data.
- `src/app/(public)/signin/page.tsx` and `signup/page.tsx` — metadata shells around client forms.
- `src/app/(admin|owner|renter)/*/layout.tsx` — navigation shells; the guard itself is a client leaf.
- `src/app/not-found.tsx`, `robots.ts`, `sitemap.ts` — static output.
- `src/lib/data`, `src/lib/domain`, `src/lib/storage`, `src/lib/actions` — modules with no JSX.
- `src/data/seed` — pure data construction.

The catalogue’s first paint uses seeded cars and bookings on the server. This ensures useful HTML, metadata, and a stable layout before browser storage is read.

### Client leaves

There are 59 files with `"use client"` at the time of writing. They fall into five groups:

| Group | Examples | Why the client is required |
| --- | --- | --- |
| Session and auth | `SessionMenu`, `SignInForm`, `SignUpForm`, `SignOutButton`, `RoleGuard` | Reads `sessionStorage`, handles form events and navigation |
| Storage-backed screens | `CatalogueResults`, `StoredCarDetail`, `useCars`, `useBookings`, `useReviews`, `useDisputes`, `useUsers`, `useAnnouncements` | Subscribes to browser storage with `useSyncExternalStore` |
| Mutating forms | `CheckoutForm`, `CarForm`, `ReviewForm`, `OpenDisputeForm`, `AdminAnnouncements` | Controlled inputs, validation feedback, and action calls |
| Booking and dashboard UI | `BookingDetail`, `TripTracker`, `OwnerBookingRequests`, `RenterDashboard`, `OwnerDashboard`, `OwnerEarnings` | Reads live records, filters by the signed-in user, and triggers transitions |
| Shared UI primitives | `src/components/ui/*` | Base UI/Radix primitives require client-side event and focus handling |

`src/app/global-error.tsx` and `src/app/providers.tsx` are also client components by framework requirement.

### Hybrid components

Two components deliberately combine server-provided initial data with client state:

- `CatalogueResults` receives `initialCars` and `initialBookings`, then subscribes to both stores. The server result is also the hydration snapshot, so the first client render matches the server HTML.
- `StoredCarDetail` receives the seeded car and reviews, then reads the live car and review collections after mount.

`StoredCarDetail` also passes optional trip dates from the URL into the checkout link, so a date-filtered search keeps its context.

### Hooks

Hooks are client-only modules:

- `useSession` — session and hydration state.
- `useCars`, `useBookings`, `useReviews`, `useDisputes`, `useUsers`, `useAnnouncements` — reactive reads.
- `useCarMutations`, `useBookingMutations` — action wrappers.
- `useStorageSync` — cross-tab and same-tab storage updates.

They are imported only by client leaves. Server pages read the same data through `src/lib/data` instead.

## Props across the boundary

Only serializable values cross from a Server Component to a Client Component:

- Records (`Car`, `Booking`, `Review`, `User`, `Dispute`, `Announcement`).
- Strings and numbers for labels, prices, and dates.
- Plain initial collections and optional date strings.

No callbacks are passed across the boundary. A client leaf calls actions directly and updates its own state.

## Why not make everything a client component?

- Public pages keep search-relevant HTML and metadata without waiting for JavaScript.
- The browser does not download data-reading logic for pages that only display seed data.
- Server rendering avoids a blank first frame for catalogue and detail pages.
- Client leaves stay small and focused on interaction.

## Why not make everything a server component?

Browser storage, session state, form events, and the signed-in experience are inherently client-side in this demo. The split is deliberate: server for content, client for interaction and local persistence.

## Adding a new component

1. Start without `"use client"`.
2. Read data through `src/lib/data` if the component renders on the server.
3. Add `"use client"` only when you need storage, state, effects, or event handlers.
4. Pass only serializable data from server to client.
5. Keep the interactive part as small as possible; wrap static siblings on the server.
6. Use the same domain functions in the client preview and the action that writes.
