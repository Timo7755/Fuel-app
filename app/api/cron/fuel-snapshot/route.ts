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

  const latest = await prisma.fuelPriceSnapshot.findFirst({
    orderBy: { capturedAt: "desc" },
  });

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  if (latest && latest.capturedAt > fourteenDaysAgo) {
    return Response.json({ ok: true, skipped: true, reason: "Too soon" });
  }

  const stations = await getAllStations();
  const { motorway, local } = splitMotorwayLocal(stations);
  const localAvg = getNationalAverages(local);
  const motorwayAvg = getNationalAverages(motorway);

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

  return Response.json({ ok: true, skipped: false, capturedAt: new Date() });
}
