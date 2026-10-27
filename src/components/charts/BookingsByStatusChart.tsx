"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { StatusCount } from "@/lib/domain/chartData";
import {
  bookingStatusLabel,
  bookingStatusTone,
  type StatusTone,
} from "@/lib/status";
import type { BookingStatus } from "@/types";

const TONE_FILL: Record<StatusTone, string> = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  info: "var(--color-info)",
  danger: "var(--color-danger)",
  neutral: "var(--color-neutral)",
};

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-ink)",
  fontSize: 12,
} as const;

export default function BookingsByStatusChart({
  data,
}: {
  data: StatusCount[];
}) {
  return (
    <div aria-hidden="true" className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
          accessibilityLayer={false}
        >
          <CartesianGrid
            stroke="var(--color-border)"
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="status"
            width={96}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
            tickFormatter={(value) =>
              bookingStatusLabel(value as BookingStatus)
            }
          />
          <Tooltip
            cursor={{ fill: "var(--color-surface-2)" }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [String(value), "Bookings"]}
            labelFormatter={(value) =>
              bookingStatusLabel(value as BookingStatus)
            }
          />
          <Bar
            dataKey="count"
            name="Bookings"
            maxBarSize={24}
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          >
            {data.map((row) => (
              <Cell
                key={row.status}
                fill={TONE_FILL[bookingStatusTone(row.status)]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
