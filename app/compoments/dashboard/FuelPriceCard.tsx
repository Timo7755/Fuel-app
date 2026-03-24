"use client";

import { useEffect, useState } from "react";
import { Fuel } from "lucide-react";

type Averages = {
  petrol95: number | null;
  diesel: number | null;
  petrol100: number | null;
  lpg: number | null;
  stationCount: number;
};

type FuelData = {
  averages: {
    local: Averages | undefined;
    motorway: Averages | undefined;
  };
};

const FUEL_TYPES = [
  { key: "petrol95" as const, label: "Petrol 95" },
  { key: "diesel" as const, label: "Diesel" },
  { key: "petrol100" as const, label: "Petrol 100" },
  { key: "lpg" as const, label: "LPG" },
];

function PriceBlock({
  title,
  icon,
  averages,
  loading,
}: {
  title: string;
  icon: string;
  averages: Averages | null;
  loading: boolean;
}) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {averages && (
          <span className="ml-auto text-xs text-muted-foreground">
            {averages.stationCount} stations
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-7 w-full rounded bg-muted" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {FUEL_TYPES.filter((f) => averages?.[f.key] !== null).map((f) => (
            <div key={f.key} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{f.label}</span>
              <span className="text-base font-bold">
                €{averages?.[f.key]?.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FuelPriceCard() {
  const [data, setData] = useState<FuelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fuel-prices")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Fuel className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">
          National Average Prices
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          Updated hourly
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <PriceBlock
          title="Local Stations"
          icon=""
          averages={data?.averages?.local ?? null}
          loading={loading}
        />
        <PriceBlock
          title="Motorway Stations"
          icon=""
          averages={data?.averages?.motorway ?? null}
          loading={loading}
        />
      </div>

      {/* Difference callout */}
      {!loading &&
        data?.averages?.local &&
        data?.averages?.motorway &&
        (() => {
          const diff = (
            (data.averages.motorway.petrol95 ?? 0) -
            (data.averages.local.petrol95 ?? 0)
          ).toFixed(2);
          return (
            <p className="mt-2 text-xs text-muted-foreground text-right">
              Motorway NMB-95 avg is{" "}
              <span className="text-red-500 font-semibold">{diff}€ more</span>{" "}
              than local stations
            </p>
          );
        })()}

      {!loading &&
        data?.averages?.local &&
        data?.averages?.motorway &&
        (() => {
          const diff = (
            (data.averages.motorway.diesel ?? 0) -
            (data.averages.local.diesel ?? 0)
          ).toFixed(2);
          return (
            <p className="mt-2 text-xs text-muted-foreground text-right">
              Motorway Diesel avg is{" "}
              <span className="text-red-500 font-semibold">{diff}€ more</span>{" "}
              than local stations
            </p>
          );
        })()}
    </div>
  );
}
