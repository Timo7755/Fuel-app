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
  motorwayP95: number | null;
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

export default function FuelPriceHistoryChart({ snapshots }: Props) {
  const data = snapshots.map((s) => ({
    date: new Date(s.capturedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    localP95: s.localP95,
    motorwayP95: s.motorwayP95,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm mt-6">
      <h2 className="text-sm font-semibold text-foreground mb-0.5">
        Price History
      </h2>
      {snapshots.length < 2 ? (
        <p className="text-xs text-muted-foreground mt-1">
          PROJECT IN PROGRESS || DATA WILL APPEAR HERE SOON
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            National average Petrol 95 — local vs motorway
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
                  name === "localP95" ? "Local P95" : "Motorway P95",
                ]}
                contentStyle={TOOLTIP_STYLE}
              />
              <Legend
                formatter={(value) =>
                  value === "localP95" ? "Local P95" : "Motorway P95"
                }
                wrapperStyle={{ fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="localP95"
                stroke="var(--chart-blue)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--chart-blue)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="motorwayP95"
                stroke="var(--chart-amber)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--chart-amber)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
