import { isMotorway } from "./motorway-pks";

const MIN_PRICES: Record<keyof Station["prices"], number> = {
  "95": 1.0,
  dizel: 1.0,
  "98": 1.0,
  "100": 1.0,
  "avtoplin-lpg": 0.3,
};

export type Station = {
  pk: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  zip_code: string;
  open_hours: string;
  prices: {
    "95": number | null;
    dizel: number | null;
    "98": number | null;
    "100": number | null;
    "avtoplin-lpg": number | null;
  };
};

export type NationalAverages = {
  petrol95: number | null;
  diesel: number | null;
  petrol98: number | null;
  lpg: number | null;
  stationCount: number;
};

const TOTAL_PAGES = 22;
const BASE =
  "https://raw.githubusercontent.com/stefanb/goriva-data/master/data";

export async function getAllStations(): Promise<Station[]> {
  const pages = await Promise.all(
    Array.from({ length: TOTAL_PAGES }, (_, i) =>
      fetch(`${BASE}/search_page_${i + 1}.json`, {
        next: { revalidate: 3600 },
      }).then((r) => r.json() as Promise<{ results: Station[] }>),
    ),
  );
  return pages.flatMap((p) => p.results);
}

export function getNationalAverages(stations: Station[]): NationalAverages {
  const avg = (key: keyof Station["prices"]): number | null => {
    const vals = stations
      .map((s) => s.prices[key])
      .filter((v): v is number => v !== null && v > MIN_PRICES[key]);
    return vals.length
      ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(3))
      : null;
  };

  return {
    petrol95: avg("95"),
    diesel: avg("dizel"),
    petrol98: avg("98"),
    lpg: avg("avtoplin-lpg"),
    stationCount: stations.length,
  };
}

export function splitMotorwayLocal(stations: Station[]) {
  return {
    motorway: stations.filter((s) => isMotorway(s)),
    local: stations.filter((s) => !isMotorway(s)),
  };
}

export function checkForNewMotorwayStations(stations: Station[]): void {
  const unknown = stations.filter(
    (s) => (s.prices["95"] ?? 0) > 1.6 && !isMotorway(s),
  );
  if (unknown.length > 0) {
    console.warn(
      "⚠️ New motorway stations detected — update motorway-pks.ts:",
      unknown.map((s) => `pk=${s.pk} | ${s.name}`),
    );
  }
}

export function filterByRadius(
  stations: Station[],
  lat: number,
  lng: number,
  radiusKm: number,
): Station[] {
  return stations
    .filter((s) => {
      const R = 6371;
      const dLat = ((s.lat - lat) * Math.PI) / 180;
      const dLng = ((s.lng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((s.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return d <= radiusKm;
    })
    .sort((a, b) => (a.prices["95"] ?? 99) - (b.prices["95"] ?? 99));
}
