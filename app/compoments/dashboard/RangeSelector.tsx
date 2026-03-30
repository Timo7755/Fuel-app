"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import type { Range } from "@/lib/dashboard/get-dashboard-data";
import { useRangeMode } from "@/lib/hooks/useRangeMode";

const options: { label: string; value: Range }[] = [
  { label: "1 Month", value: "1M" },
  { label: "3 Months", value: "3M" },
  { label: "1 Year", value: "1Y" },
];

export default function RangeSelector() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = (searchParams.get("range") as Range) ?? "1M";
  const vehicleId = searchParams.get("vehicleId");
  const fuelType = searchParams.get("fuelType");

  const { mode, toggle } = useRangeMode();

  return (
    <div className="mb-6 flex flex-col items-center gap-2">
      <div className="inline-flex overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {options.map((opt) => (
          <Link
            key={opt.value}
            href={`?range=${opt.value}&mode=${mode}${vehicleId ? `&vehicleId=${vehicleId}` : ""}${fuelType ? `&fuelType=${fuelType}` : ""}`}
            onClick={() => {
              fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ preferredRange: opt.value }),
              }).catch(console.error);
            }}
            className={`px-4 py-1.5 text-sm font-medium transition border-r border-border last:border-r-0
              ${
                current === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {current === "1M" && (
        <button
          onClick={() => {
            const next = mode === "rolling" ? "calendar" : "rolling";
            toggle();
            router.replace(
              `?range=${current}&mode=${next}${vehicleId ? `&vehicleId=${vehicleId}` : ""}${fuelType ? `&fuelType=${fuelType}` : ""}`,
            );
          }}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 mt-2 text-xs shadow-sm transition hover:bg-muted cursor-pointer"
        >
          <span
            className={
              mode === "rolling"
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            }
          >
            Last 30 days
          </span>
          <span className="text-border">|</span>
          <span
            className={
              mode === "calendar"
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            }
          >
            This month
          </span>
        </button>
      )}
    </div>
  );
}
