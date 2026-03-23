import {
  getAllStations,
  getNationalAverages,
  splitMotorwayLocal,
  checkForNewMotorwayStations,
  filterByRadius,
} from "@/lib/fuel-prices/get-fuel-prices";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = Number(searchParams.get("radius") ?? 10);

  const stations = await getAllStations();
  checkForNewMotorwayStations(stations);

  const { motorway, local } = splitMotorwayLocal(stations);

  const averages = {
    local: getNationalAverages(local),
    motorway: getNationalAverages(motorway),
  };

  const nearby =
    lat && lng ? filterByRadius(local, Number(lat), Number(lng), radius) : [];

  return Response.json({ averages, nearby });
}
