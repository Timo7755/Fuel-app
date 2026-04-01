"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Range } from "@/lib/dashboard/get-dashboard-data";
import { useRangeMode } from "@/lib/hooks/useRangeMode";
import { ChevronDown } from "lucide-react";

const options: { label: string; value: Range }[] = [
  { label: "1 Month", value: "1M" },
  { label: "3 Months", value: "3M" },
  { label: "1 Year", value: "1Y" },
];

function formatMonth(yyyyMM: string) {
  const [year, month] = yyyyMM.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" },
  );
}

export default function RangeSelector() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = (searchParams.get("range") as Range) ?? "1M";
  const vehicleId = searchParams.get("vehicleId");
  const fuelType = searchParams.get("fuelType");
  const currentMonth = searchParams.get("month");
  const { mode, toggle } = useRangeMode();

  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/fill-up-months")
      .then((r) => r.json())
      .then(setAvailableMonths)
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function buildUrl(overrides: Record<string, string | null>) {
    const params = new URLSearchParams();
    const base = {
      range: current,
      mode,
      vehicleId,
      fuelType,
      month: currentMonth,
    };
    const merged = { ...base, ...overrides };
    if (merged.range) params.set("range", merged.range);
    if (merged.mode) params.set("mode", merged.mode);
    if (merged.vehicleId) params.set("vehicleId", merged.vehicleId);
    if (merged.fuelType) params.set("fuelType", merged.fuelType);
    if (merged.month) params.set("month", merged.month);
    return `?${params.toString()}`;
  }

  function selectMonth(month: string) {
    router.push(buildUrl({ month, range: "1M", mode: "rolling" }));
    setDropdownOpen(false);
  }

  const activeMonthLabel = currentMonth ? formatMonth(currentMonth) : null;

  // Get current month in YYYY-MM for default label
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const defaultMonthLabel = formatMonth(thisMonth);

  return (
    <div className="mb-6 flex flex-col items-center gap-2">
      {/* Range pills */}
      <div className="inline-flex overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {options.map((opt) => (
          <Link
            key={opt.value}
            href={buildUrl({ range: opt.value, month: null })}
            onClick={() => {
              fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ preferredRange: opt.value }),
              }).catch(console.error);
            }}
            className={`px-4 py-1.5 text-sm font-medium transition border-r border-border last:border-r-0
              ${
                current === opt.value && !currentMonth
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Month toggle row — only shows on 1M or when month is active */}
      {(current === "1M" || currentMonth) && (
        <div className="flex items-center gap-2">
          {/* Last 30 days button */}
          <button
            onClick={() => {
              router.replace(buildUrl({ mode: "rolling", month: null }));
            }}
            className={`rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm transition hover:bg-muted cursor-pointer ${
              !currentMonth && mode === "rolling"
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Last 30 days
          </button>

          <span className="text-border">|</span>

          {/* Month picker */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => {
                if (!currentMonth) {
                  // activate current month
                  selectMonth(thisMonth);
                } else {
                  setDropdownOpen((v) => !v);
                }
              }}
              className={`flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm transition hover:bg-muted cursor-pointer ${
                currentMonth
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {activeMonthLabel ?? defaultMonthLabel}
              <ChevronDown
                className={`h-3 w-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && availableMonths.length > 0 && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                {availableMonths.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectMonth(m)}
                    className={`flex w-full items-center px-4 py-2.5 text-sm transition
                      ${
                        currentMonth === m
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                  >
                    {formatMonth(m)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
