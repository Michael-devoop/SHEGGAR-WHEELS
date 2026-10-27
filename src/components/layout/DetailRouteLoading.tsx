export default function DetailRouteLoading({ label }: { label: string }) {
  return (
    <div
      className="shell py-8 sm:py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      <div className="h-9 w-56 animate-pulse rounded-md bg-surface-2" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="h-96 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-64 animate-pulse rounded-lg bg-surface-2" />
      </div>
    </div>
  );
}
