import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { FillUpEntry } from "./types";

export async function getStatsData(): Promise<FillUpEntry[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const fillUps = await prisma.fuelFillUp.findMany({
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
  });

  return fillUps.map((fillUp) => ({
    ...fillUp,
    date: fillUp.date.toISOString(),
    odometerKm: fillUp.odometerKm ?? null,
  }));
}
