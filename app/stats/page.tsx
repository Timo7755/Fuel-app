import { getStatsData } from "@/lib/dashboard/get-stats-data";
import FuelChart from "../compoments/dashboard/FuelChart";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const { fillUps, vehicles } = await getStatsData();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your fuel trends over time
        </p>
      </div>
      <FuelChart fillUps={fillUps} vehicles={vehicles} />
    </main>
  );
}
