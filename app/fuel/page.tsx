import FuelPriceCard from "@/app/compoments/dashboard/FuelPriceCard";
import FuelPriceHistoryChart from "../compoments/dashboard/FuelPriceHistoryChart";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FuelPage() {
  const snapshots = await prisma.fuelPriceSnapshot.findMany({
    orderBy: { capturedAt: "asc" },
    select: {
      capturedAt: true,
      localP95: true,
      motorwayP95: true,
    },
  });

  const serialized = snapshots.map((s) => ({
    capturedAt: s.capturedAt.toISOString(),
    localP95: s.localP95,
    motorwayP95: s.motorwayP95,
  }));

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Fuel Prices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fuel prices for Slovenia
        </p>
      </div>
      <FuelPriceCard />
      <FuelPriceHistoryChart snapshots={serialized} />
    </main>
  );
}
