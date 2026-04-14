import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAllStations,
  splitMotorwayLocal,
  getNationalAverages,
} from "@/lib/fuel-prices/get-fuel-prices";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stations = await getAllStations();
  const { motorway, local } = splitMotorwayLocal(stations);
  const localAvg = getNationalAverages(local);
  const motorwayAvg = getNationalAverages(motorway);

  const latest = await prisma.fuelPriceSnapshot.findFirst({
    orderBy: { capturedAt: "desc" },
  });

  const THRESHOLD = 0.02;
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const forceUpdate = !latest || latest.capturedAt < fourteenDaysAgo;

  const priceChanged =
    Math.abs((latest?.localP95 ?? 0) - (localAvg.petrol95 ?? 0)) > THRESHOLD ||
    Math.abs((latest?.localDiesel ?? 0) - (localAvg.diesel ?? 0)) > THRESHOLD ||
    Math.abs((latest?.localP100 ?? 0) - (localAvg.petrol100 ?? 0)) >
      THRESHOLD ||
    Math.abs((latest?.localLpg ?? 0) - (localAvg.lpg ?? 0)) > THRESHOLD ||
    Math.abs((latest?.motorwayP95 ?? 0) - (motorwayAvg.petrol95 ?? 0)) >
      THRESHOLD ||
    Math.abs((latest?.motorwayDiesel ?? 0) - (motorwayAvg.diesel ?? 0)) >
      THRESHOLD ||
    Math.abs((latest?.motorwayP100 ?? 0) - (motorwayAvg.petrol100 ?? 0)) >
      THRESHOLD ||
    Math.abs((latest?.motorwayLpg ?? 0) - (motorwayAvg.lpg ?? 0)) > THRESHOLD;

  if (priceChanged || forceUpdate) {
    await prisma.fuelPriceSnapshot.create({
      data: {
        localP95: localAvg.petrol95,
        localDiesel: localAvg.diesel,
        localP100: localAvg.petrol100,
        localLpg: localAvg.lpg,
        motorwayP95: motorwayAvg.petrol95,
        motorwayDiesel: motorwayAvg.diesel,
        motorwayP100: motorwayAvg.petrol100,
        motorwayLpg: motorwayAvg.lpg,
      },
    });
  }

  return Response.json({
    ok: true,
    priceChanged,
    forceUpdate,
    capturedAt: new Date(),
  });
}
