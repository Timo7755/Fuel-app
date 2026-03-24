import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseMode, getFromDate } from "./range";
import type { DashboardData, FillUpEntry, Summary, Vehicle } from "./types";

export type Range = "1M" | "3M" | "1Y";

export async function getDashboardData(
  range: Range = "1M",
  mode: string = "rolling",
  vehicleId?: number,
): Promise<DashboardData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const fromDate = getFromDate(range, parseMode(mode));

  const fillUps = await prisma.fuelFillUp.findMany({
    where: {
      userId,
      date: { gte: fromDate },
      ...(vehicleId ? { vehicleId } : {}),
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      liters: true,
      totalCost: true,
      odometerKm: true,
      isFullTank: true,
      fuelType: true,
      vehicleId: true,
    },
  });

  // All fill-ups count for cost and liters
  const totalLiters = fillUps.reduce((sum, f) => sum + f.liters, 0);
  const totalFuelCost = fillUps.reduce((sum, f) => sum + f.totalCost, 0);

  // Only fill-ups with a valid odometer reading count for distance calculations
  const sorted = [...fillUps]
    .filter((f) => f.odometerKm !== null && f.odometerKm > 0) // ← key change
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const first = sorted[0]?.odometerKm ?? null;
  const last = sorted[sorted.length - 1]?.odometerKm ?? null;

  const distanceKm =
    first !== null && last !== null && last > first ? last - first : null; // ← null instead of 0 so UI can show "—" instead of "0 km"

  // Exclude first odometer entry from consumption (it's the baseline reading)
  const litersForConsumption = sorted
    .slice(1)
    .reduce((sum, f) => sum + f.liters, 0);

  const summary: Summary = {
    range,
    totalFuelCost,
    totalLiters,
    distanceKm,
    litersPerKm:
      distanceKm && distanceKm > 0 && litersForConsumption > 0
        ? (litersForConsumption / distanceKm) * 100
        : null,
    costPerKm:
      distanceKm && distanceKm > 0 && litersForConsumption > 0
        ? totalFuelCost / distanceKm
        : null,
    fillUpsCount: fillUps.length,
  };

  const formattedFillUps: FillUpEntry[] = fillUps.map((f) => ({
    ...f,
    date: f.date.toISOString(),
    odometerKm: f.odometerKm ?? null,
  }));

  const vehicles = await prisma.vehicle.findMany({
    where: {
      fillUps: {
        some: { userId }, // <- vehicles that have at least one fill-up by this user
      },
    },
    select: {
      id: true,
      name: true,
      brand: true,
      model: true,
      fuelCategory: true,
    },
  });

  return { summary, fillUps: formattedFillUps, vehicles };
}
