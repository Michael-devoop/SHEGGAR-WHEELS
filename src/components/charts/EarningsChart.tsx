"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyEarning } from "@/lib/domain/chartData";
import { formatETB } from "@/lib/format";

const compactCurrency = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-ink)",
  fontSize: 12,
} as const;

export default function EarningsChart({ data }: { data: MonthlyEarning[] }) {
  return (
    <div aria-hidden="true" className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          accessibilityLayer={false}
        >
          <CartesianGrid
            stroke="var(--color-border)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="shortLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={56}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
            tickFormatter={(value: number) => compactCurrency.format(value)}
          />
          <Tooltip
            cursor={{ fill: "var(--color-surface-2)" }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [formatETB(Number(value)), "Earned"]}
          />
          <Bar
            dataKey="total"
            name="Earned"
            fill="var(--color-chart-2)"
            maxBarSize={56}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
