import FuelPriceCard from "@/app/compoments/dashboard/FuelPriceCard";
import FuelPriceHistoryChart from "../compoments/dashboard/FuelPriceHistoryChart";
import { prisma } from "@/lib/prisma";
import PriceChangeSummary from "../compoments/dashboard/PriceChangeSummary";

export const dynamic = "force-dynamic";

export default async function FuelPage() {
  const snapshots = await prisma.fuelPriceSnapshot.findMany({
    orderBy: { capturedAt: "asc" },
    select: {
      capturedAt: true,
      localP95: true,
      localDiesel: true,
      localP100: true,
      localLpg: true,
      motorwayP95: true,
      motorwayDiesel: true,
      motorwayP100: true,
      motorwayLpg: true,
    },
  });

  const serialized = snapshots.map((s) => ({
    ...s,
    capturedAt: s.capturedAt.toISOString(),
  }));

  const latest =
    serialized.length > 0 ? serialized[serialized.length - 1] : null;

  const twoWeeksAgo = latest ? new Date(latest.capturedAt) : new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const reference =
    serialized.length > 1
      ? serialized.reduce((prev, curr) => {
          const prevDiff = Math.abs(
            new Date(prev.capturedAt).getTime() - twoWeeksAgo.getTime(),
          );
          const currDiff = Math.abs(
            new Date(curr.capturedAt).getTime() - twoWeeksAgo.getTime(),
          );
          return currDiff < prevDiff ? curr : prev;
        })
      : null;

  const validReference =
    reference && latest && reference.capturedAt !== latest.capturedAt
      ? reference
      : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Fuel Prices</h1>
      </div>
      <FuelPriceCard />
      {latest && validReference && (
        <PriceChangeSummary latest={latest} reference={validReference} />
      )}
      <FuelPriceHistoryChart snapshots={serialized} />
    </main>
  );
}
