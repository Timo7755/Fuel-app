import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseRange, getFromDate, parseMode } from "@/lib/dashboard/range";
import { auth } from "@/auth";

export async function GET(request: Request) {
  // getServerSession reads the session cookie and returns the current user
  const session = await auth();

  // If no session, return 401 Unauthorized
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const range = parseRange(searchParams.get("range"));
  const mode = parseMode(searchParams.get("mode"));
  const fromDate = getFromDate(range, mode);

  try {
    const fillUps = await prisma.fuelFillUp.findMany({
      where: {
        userId, // only this user's data
        date: { gte: fromDate },
      },
      orderBy: { date: "asc" },
    });

    const totalFuelCost = fillUps.reduce((sum, f) => sum + f.totalCost, 0);
    const totalLiters = fillUps.reduce((sum, f) => sum + f.liters, 0);

    const odometerValues = fillUps
      .map((f) => f.odometerKm)
      .filter((v): v is number => typeof v === "number");

    const distanceKm =
      odometerValues.length >= 2
        ? Math.max(...odometerValues) - Math.min(...odometerValues)
        : 0;

    const costPerKm = distanceKm > 0 ? totalFuelCost / distanceKm : null;

    const litersPerKm = distanceKm > 0 ? totalLiters / distanceKm : null;

    return NextResponse.json({
      range,
      totalFuelCost,
      totalLiters,
      distanceKm,
      litersPerKm,
      costPerKm,
      fillUpsCount: fillUps.length,
    });
  } catch (error) {
    console.error("Error building dashboard summary:", error);
    return NextResponse.json(
      { error: "Failed to build dashboard summary" },
      { status: 500 },
    );
  }
}
