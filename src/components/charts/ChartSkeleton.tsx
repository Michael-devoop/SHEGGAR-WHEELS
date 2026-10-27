export default function ChartSkeleton({
  label,
  height = 260,
}: {
  label: string;
  height?: number;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ height }}
      className="grid w-full place-items-center rounded-md bg-surface-2"
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="size-7 animate-spin rounded-full border-2 border-border border-t-ink"
      />
    </div>
  );
}
