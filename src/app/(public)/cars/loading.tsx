export default function Loading() {
  return (
    <div
      className="shell py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading cars…</span>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-lg bg-surface-2"
          />
        ))}
      </div>
    </div>
  );
}
