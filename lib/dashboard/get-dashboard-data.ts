import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseMode, getFromDate } from "./range";
import type { DashboardData, FillUpEntry, Summary, FuelType } from "./types";

export type Range = "1M" | "3M" | "1Y";

export async function getDashboardData(
  range: Range = "1M",
  mode: string = "rolling",
  vehicleId?: number,
  fuelType?: FuelType,
): Promise<DashboardData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const fromDate = getFromDate(range, parseMode(mode));

  const allFillUps = await prisma.fuelFillUp.findMany({
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

  const fillUps = fuelType
    ? allFillUps.filter((f) => f.fuelType === fuelType)
    : allFillUps;

  // All fill-ups count for cost and liters
  const totalLiters = fillUps.reduce((sum, f) => sum + f.liters, 0);
  const totalFuelCost = fillUps.reduce((sum, f) => sum + f.totalCost, 0);

  // only valid ones for distance calculations
  const singleVehicle = !!vehicleId;
  const sorted = [...allFillUps]

    .filter((f) => f.odometerKm !== null && f.odometerKm > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const first = sorted[0]?.odometerKm ?? null;
  const last = sorted[sorted.length - 1]?.odometerKm ?? null;

  const distanceKm =
    singleVehicle && first !== null && last !== null && last > first
      ? last - first
      : null;

  const allLpg = sorted.slice(1).every((f) => f.fuelType === "LPG");

  const litersForConsumption = singleVehicle
    ? sorted
        .slice(1)
        .filter((f) =>
          fuelType ? f.fuelType === fuelType : allLpg || f.fuelType !== "LPG",
        )
        .reduce((sum, f) => sum + f.liters, 0)
    : 0;

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
      hasLpg: true,
    },
  });

  const availableFuelTypes = [
    ...new Set(allFillUps.map((f) => f.fuelType)),
  ] as FuelType[];

  return { summary, fillUps: formattedFillUps, vehicles, availableFuelTypes };
}
