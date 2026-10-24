import { carStatusLabel, carStatusTone, type StatusTone } from "@/lib/status";
import type { CarStatus } from "@/types";

const TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  info: "bg-info-bg text-info",
  danger: "bg-danger-bg text-danger",
  neutral: "bg-neutral-bg text-neutral",
};

export default function CarStatusBadge({
  status,
  className = "",
}: {
  status: CarStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold ${TONE_CLASS[carStatusTone(status)]} ${className}`}
    >
      {carStatusLabel(status)}
    </span>
  );
}
