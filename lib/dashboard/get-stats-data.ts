import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { FillUpEntry, Vehicle } from "./types";

export async function getStatsData(): Promise<{
  fillUps: FillUpEntry[];
  vehicles: Vehicle[];
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [fillUps, vehicles] = await Promise.all([
    prisma.fuelFillUp.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
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
    }),
    prisma.vehicle.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        brand: true,
        model: true,
        year: true,
        fuelCategory: true,
        hasLpg: true,
      },
    }),
  ]);

  return {
    fillUps: fillUps.map((f) => ({
      ...f,
      date: f.date.toISOString(),
      odometerKm: f.odometerKm ?? null,
    })),
    vehicles,
  };
}
