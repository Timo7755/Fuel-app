"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { FillUpEntry } from "@/lib/dashboard/types";

type Range = "3M" | "6M" | "1Y" | "all";

type Props = {
  fillUps: FillUpEntry[];
};

const RANGES: { label: string; value: Range }[] = [
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "All", value: "all" },
];

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: "8px",
  border: "1px solid var(--chart-border)",
  backgroundColor: "var(--chart-card)",
  color: "var(--chart-text)",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

function getFromDate(range: Range): Date | null {
  if (range === "all") return null;
  const now = new Date();
  const months = range === "3M" ? 3 : range === "6M" ? 6 : 12;
  return new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
}

export default function FuelChart({ fillUps }: Props) {
  const [range, setRange] = useState<Range>("1Y");

  const fromDate = getFromDate(range);
  const filtered = fromDate
    ? fillUps.filter((f) => new Date(f.date) >= fromDate)
    : fillUps;

  if (filtered.length < 2) {
    return (
      <div className="space-y-4">
        <RangeSelector range={range} onChange={setRange} />
        <p className="text-center text-sm text-muted-foreground py-8">
          Not enough data for this period.
        </p>
      </div>
    );
  }

  const spendData = filtered.map((f) => ({
    date: new Date(f.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    cost: Number(f.totalCost.toFixed(2)),
  }));

  // Monthly spend
  const monthMap: Record<string, { month: string; totalCost: number }> = {};
  for (const f of filtered) {
    const key = new Date(f.date).toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
    });
    if (!monthMap[key]) monthMap[key] = { month: key, totalCost: 0 };
    monthMap[key].totalCost += f.totalCost;
  }
  const monthlyData = Object.values(monthMap).map((m) => ({
    ...m,
    totalCost: Number(m.totalCost.toFixed(2)),
  }));

  // Monthly km — only fill-ups with odometer
  const kmMap: Record<string, { month: string; odometers: number[] }> = {};
  for (const f of filtered) {
    if (f.odometerKm === null) continue;
    const key = new Date(f.date).toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
    });
    if (!kmMap[key]) kmMap[key] = { month: key, odometers: [] };
    kmMap[key].odometers.push(f.odometerKm);
  }
  const kmData = Object.values(kmMap)
    .map((m) => ({
      month: m.month,
      km: Math.round(Math.max(...m.odometers) - Math.min(...m.odometers)),
    }))
    .filter((m) => m.km > 0);

  const hasKmData = kmData.length >= 2;

  return (
    <div className="space-y-4">
      <RangeSelector range={range} onChange={setRange} />

      {/* Monthly spend */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-0.5">
          Monthly spending
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Total fuel cost per calendar month
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={monthlyData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--chart-grid)"
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "var(--chart-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--chart-muted)" }}
              tickFormatter={(v) => `€${v}`}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(value) => [
                value !== undefined ? `€${Number(value).toFixed(2)}` : "—",
                "Total cost",
              ]}
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: "var(--chart-cursor)" }}
            />
            <Bar
              dataKey="totalCost"
              fill="var(--chart-blue)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost per fill-up */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-0.5">
          Cost per fill-up
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          See how much you spend on each fuel fill-up
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={spendData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-blue)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-blue)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--chart-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--chart-muted)" }}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `€${v}`}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(value) => [
                value !== undefined ? `€${Number(value).toFixed(2)}` : "—",
                "Cost",
              ]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="var(--chart-blue)"
              strokeWidth={2}
              fill="url(#blueGradient)"
              dot={{ r: 3, fill: "var(--chart-blue)", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "var(--chart-blue)", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly km */}
      {hasKmData ? (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-0.5">
            See how much you drive per month
          </h2>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={kmData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--chart-grid)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--chart-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--chart-muted)" }}
                tickFormatter={(v) => `${v}km`}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                formatter={(value) => [
                  value !== undefined
                    ? `${Number(value).toLocaleString()} km`
                    : "—",
                  "Distance",
                ]}
                contentStyle={TOOLTIP_STYLE}
                cursor={{ fill: "var(--chart-cursor)" }}
              />
              <Bar
                dataKey="km"
                fill="var(--chart-blue)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-0.5">
            How much you drive per month
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Enter odometer readings on your fill-ups to see monthly distance
            tracking.
          </p>
        </div>
      )}
    </div>
  );
}

function RangeSelector({
  range,
  onChange,
}: {
  range: Range;
  onChange: (r: Range) => void;
}) {
  return (
    <div className="flex gap-1.5 justify-end">
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onChange(r.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition
            ${
              range === r.value
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
