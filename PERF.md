# Performance Notes

## Current verification

The production build completes successfully. At the time of writing, the suite has 168 passing tests across 15 files, ESLint is clean, and `tsc --noEmit` reports no errors.

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Verified build characteristics:

- Public pages are prerendered or use Partial Prerender.
- Admin, owner, and renter shells are prerendered; record-specific routes stream after the initial shell.
- `/cars` and `/cars/[id]` ship server-rendered first paint before browser storage takes over.
- No route currently has a recorded Lighthouse or Web Vitals measurement.

This document therefore records architectural intent and known limits, not claimed field metrics.

## Rendering strategy

### Server-first public surface

The home page, catalogue, car detail, sign-in, and sign-up are Server Components unless they need browser state. The catalogue receives seeded cars and bookings on the server, then hydrates into live storage reads.

Benefits:

- Useful HTML and metadata before JavaScript runs.
- Search-engine-friendly listing pages.
- The browser does not need the full dataset to render the first paint.

### Partial Prerender

The app enables `cacheComponents` and `partialPrefetching` in `next.config.ts`. Public catalogue and detail shells can be prerendered while dynamic, storage-dependent content streams in.

### Client leaves

Interactive features are isolated:
- Forms and mutation buttons.
- Storage-backed lists.
- Session and role guards.
- Navigation active state and mobile tabs.

This keeps storage and event handlers out of the server render path. See [`BOUNDARY.md`](./BOUNDARY.md).

## Deliberate performance choices

- **String snapshots for `useSyncExternalStore`.** A fresh sorted array does not trigger an endless render loop because equal data produces an equal string.
- **Page size of 9.** Catalogue pagination is small enough for a mobile-first grid and avoids an unbounded first render.
- **Seed fallback on the server.** No network request is needed for first paint.
- **Pure filtering before pagination.** The catalogue filters approved cars, dates, price, and text, then paginates once.
- **Local date arithmetic in UTC.** Date-only values avoid timezone drift and hydration mismatches.
- **No heavy animation or chart library on public pages.** Motion is CSS-based; icons are tree-shaken from `lucide-react`.

## Known limits

1. **Every collection is parsed and serialized in full.** `JSON.stringify` runs on each snapshot read. With the demo dataset this is cheap; with thousands of records it is not.
2. **No virtualized lists.** Admin and owner tables render all matching rows.
3. **No image optimization.** Car images use `unoptimized` because the demo images are local placeholders. A production build should use a real image pipeline and remote patterns allowlist.
4. **No persisted query cache.** Storage subscriptions replace React Query for current reads. The provider exists for future async work.
5. **No performance measurement in CI.** Bundle budgets and Web Vitals are not tracked yet.
6. **No offline support.** Storage is local, but there is no service worker or installable app manifest.

## Suggested budgets for the next phase

| Surface | Metric | Target |
| --- | --- | --- |
| Public pages | LCP (mobile) | < 2.5 s |
| Public pages | INP | < 200 ms |
| All routes | CLS | < 0.1 |
| Catalogue | Initial JS for route | < 150 kB gzipped |
| Actions | Local mutation feedback | < 100 ms perceived |
| Catalogue | Filter interaction | < 100 ms |

Measure these with Lighthouse and real-device testing before recording results. Do not carry numbers forward from another project.

## Next performance work

- Add a bundle analyzer and fail CI when a route exceeds its budget.
- Replace full-collection serialization with keyed selectors or a real query layer.
- Add virtualization to admin tables if the dataset grows.
- Serve real car photos through `next/image` with an allowlisted remote host.
- Add route-level `loading.tsx` skeletons where partial prerender still leaves a visible gap.
- Add Playwright traces for checkout and owner booking flows so regressions are measurable.
