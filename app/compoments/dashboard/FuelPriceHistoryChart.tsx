"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Snapshot = {
  capturedAt: string;
  localP95: number | null;
  localDiesel: number | null;
  localP100: number | null;
  localLpg: number | null;
  motorwayP95: number | null;
  motorwayDiesel: number | null;
  motorwayP100: number | null;
  motorwayLpg: number | null;
};

type Props = {
  snapshots: Snapshot[];
};

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: "8px",
  border: "1px solid var(--chart-border)",
  backgroundColor: "var(--chart-card)",
  color: "var(--chart-text)",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

const FUEL_LINES = [
  { key: "P95", color: "var(--chart-green" },
  { key: "Diesel", color: "var(--chart-amber)" },
  { key: "P100", color: "var(--chart-purple)" },
  { key: "LPG", color: "var(--chart-blue)" },
];

function PriceHistoryChart({
  title,
  data,
}: {
  title: string;
  data: Record<string, string | number | null>[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground mb-0.5">{title}</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Average price per fuel type over time
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
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
            width={52}
          />
          <Tooltip
            formatter={(value, name) => [
              value !== undefined ? `€${Number(value).toFixed(3)}` : "—",
              name,
            ]}
            contentStyle={TOOLTIP_STYLE}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {FUEL_LINES.map((f) => (
            <Line
              key={f.key}
              type="monotone"
              dataKey={f.key}
              stroke={f.color}
              strokeWidth={2}
              dot={{ r: 3, fill: f.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function FuelPriceHistoryChart({ snapshots }: Props) {
  if (snapshots.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-0.5">
          Price History
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          PROJECT IN PROGRESS || DATA WILL APPEAR HERE SOON
        </p>
      </div>
    );
  }

  const localData = snapshots.map((s) => ({
    date: new Date(s.capturedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    P95: s.localP95,
    Diesel: s.localDiesel,
    P100: s.localP100,
    LPG: s.localLpg,
  }));

  const motorwayData = snapshots.map((s) => ({
    date: new Date(s.capturedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    P95: s.motorwayP95,
    Diesel: s.motorwayDiesel,
    P100: s.motorwayP100,
    LPG: s.motorwayLpg,
  }));

  return (
    <div className="space-y-4 mt-6">
      <PriceHistoryChart
        title="Local Stations — Price History"
        data={localData}
      />
      <PriceHistoryChart
        title="Motorway Stations — Price History"
        data={motorwayData}
      />
    </div>
  );
}
