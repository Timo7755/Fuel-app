import type { Summary } from "@/lib/dashboard/types";
import { Fuel, Droplets, Route, TrendingUp, Hash, Gauge } from "lucide-react";
import AddFillUpButton from "./AddFillUpButton";

type Props = { summary: Summary };

const cards = (summary: Summary) => [
  {
    label: "Total Fuel Cost",
    value: `${summary.totalFuelCost.toFixed(2)} EUR`,
    icon: Fuel,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    label: "Total Liters",
    value: `${summary.totalLiters.toFixed(2)} L`,
    icon: Droplets,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Distance",
    value: `${summary.distanceKm.toFixed(1)} km`,
    icon: Route,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    label: "Cost per km",
    value:
      summary.costPerKm !== null
        ? `${summary.costPerKm.toFixed(2)} EUR/km`
        : "N/A",
    icon: TrendingUp,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export default function SummaryCards({ summary }: Props) {
  return (
    <>
      <div className="mb-6 flex justify-center">
        <div className="inline-flex w-auto overflow-hidden rounded-xl border border-border shadow-sm bg-card">
          <div className="flex flex-col px-5 py-3">
            <span className="text-xs text-muted-foreground">
              Avg. Consumption
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Gauge className="h-5 w-5 text-cyan-500" />
                <span className="text-xl font-bold text-foreground">
                  {summary.litersPerKm?.toFixed(2) ?? "N/A"}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    L/100km
                  </span>
                </span>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              <span>{summary.fillUpsCount} fill-ups tracked</span>
            </div>
          </div>

          {/* Divider + add button */}
          <div className="flex items-center border-l border-border px-4">
            <AddFillUpButton variant="compact" />
          </div>
        </div>
      </div>

      {/* 4 summary cards */}
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards(summary).map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="flex flex-col gap-3 rounded-xl border border-border bg-gradient-to-b from-orange-500/10 to-card p-4 shadow-sm transition"
          >
            <div className={`w-fit rounded-lg p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold leading-tight text-foreground">
                {value}
              </p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
