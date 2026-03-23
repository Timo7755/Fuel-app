import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseMode, getFromDate } from "./range";
import type { DashboardData, FillUpEntry, Summary } from "./types";

export type Range = "1M" | "3M" | "1Y";

export async function getDashboardData(
  range: Range = "1M",
  mode: string = "rolling",
): Promise<DashboardData> {
  // Read the session directly on the server — no cookie forwarding needed
  const session = await auth();

  // If somehow no session exists, stop here — don't leak other users' data
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Convert "1M" / "3M" / "1Y" into an actual Date object (e.g. 30 days ago)
  const fromDate = getFromDate(range, parseMode(mode));

  // One DB query — only fetch this user's fill-ups within the selected range
  const fillUps = await prisma.fuelFillUp.findMany({
    where: { userId, date: { gte: fromDate } }, // gte = "greater than or equal"
    orderBy: { date: "desc" },
    select: {
      // Only pull the columns we actually need — faster than SELECT *
      id: true,
      date: true,
      liters: true,
      totalCost: true,
      odometerKm: true,
      isFullTank: true,
      fuelType: true,
    },
  });

  // Add up totals from the fetched rows — no second DB query needed
  const totalLiters = fillUps.reduce((sum, f) => sum + f.liters, 0);
  const totalFuelCost = fillUps.reduce((sum, f) => sum + f.totalCost, 0);

  // Sort oldest → newest so we can find the first and last odometer reading
  const sorted = [...fillUps].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const first = sorted[0]?.odometerKm ?? null;
  const last = sorted[sorted.length - 1]?.odometerKm ?? null;

  // Distance = difference between first and last odometer reading in the period
  const distanceKm = first !== null && last !== null ? last - first : 0;

  // Important ! do not include the first fill-up in the consumption calculation
  const litersForConsumption = sorted
    .slice(1)
    .reduce((sum, f) => sum + f.liters, 0);

  const summary: Summary = {
    range,
    totalFuelCost,
    totalLiters,
    distanceKm,
    // Use litersForConsumption (excludes first fill-up) for the L/km calculation
    // multiply by 100 for l/100km
    litersPerKm:
      distanceKm > 0 && litersForConsumption > 0
        ? (litersForConsumption / distanceKm) * 100
        : null,
    costPerKm:
      distanceKm > 0 && litersForConsumption > 0
        ? totalFuelCost / distanceKm
        : null,
    fillUpsCount: fillUps.length,
  };

  // Prisma returns Date objects — convert to ISO strings so they're
  // serializable when passed from server component to client component
  const formattedFillUps: FillUpEntry[] = fillUps.map((f) => ({
    ...f,
    date: f.date.toISOString(),
    odometerKm: f.odometerKm ?? null, // ?? null converts undefined to null
  }));

  return { summary, fillUps: formattedFillUps };
}
