import SummaryCards from "@/app/compoments/dashboard/SummaryCards";
import {
  getDashboardData,
  type Range,
} from "@/lib/dashboard/get-dashboard-data";
import type { FuelType } from "@/lib/dashboard/types";

import FillUpTable from "@/app/compoments/dashboard/FillUpTable";
import RangeSelector from "@/app/compoments/dashboard/RangeSelector";
import VehicleSelector from "@/app/compoments/dashboard/VehicleSelector";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const VALID_RANGES: Range[] = ["1M", "3M", "1Y"];

type Props = {
  searchParams: Promise<{
    range?: string;
    mode?: string;
    vehicleId?: string;
    fuelType?: string;
  }>;
};
export default async function Home({ searchParams }: Props) {
  const {
    range: rangeParam,
    mode: modeParam,
    vehicleId: vehicleIdParam,
    fuelType: fuelTypeParam,
  } = await searchParams;

  const range: Range = VALID_RANGES.includes(rangeParam as Range)
    ? (rangeParam as Range)
    : "1M";

  const mode = modeParam === "calendar" ? "calendar" : "rolling";

  const vehicleId = vehicleIdParam ? Number(vehicleIdParam) : undefined;

  try {
    const { summary, fillUps, vehicles, availableFuelTypes } =
      await getDashboardData(
        range,
        mode,
        vehicleId,
        fuelTypeParam as FuelType | undefined,
      );

    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex justify-end mb-2"></div>
        <SummaryCards summary={summary} />
        <RangeSelector />
        <Suspense fallback={null}>
          <VehicleSelector />
        </Suspense>

        <FillUpTable
          data={fillUps}
          vehicles={vehicles}
          availableFuelTypes={availableFuelTypes}
        />
      </main>
    );
  } catch (error) {
    console.error("Dashboard load error:", error);
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <p className="text-red-600">Failed to load dashboard data.</p>
      </main>
    );
  }
}
