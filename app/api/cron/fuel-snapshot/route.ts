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

  const changed =
    !latest ||
    latest.localP95 !== localAvg.petrol95 ||
    latest.localDiesel !== localAvg.diesel ||
    latest.localP100 !== localAvg.petrol100 ||
    latest.localLpg !== localAvg.lpg ||
    latest.motorwayP95 !== motorwayAvg.petrol95 ||
    latest.motorwayDiesel !== motorwayAvg.diesel ||
    latest.motorwayP100 !== motorwayAvg.petrol100 ||
    latest.motorwayLpg !== motorwayAvg.lpg;

  if (changed) {
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

  return Response.json({ ok: true, changed, capturedAt: new Date() });
}
