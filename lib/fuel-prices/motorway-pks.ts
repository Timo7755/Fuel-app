// lib/fuel-prices/motorway-pks.ts

// Last verified: March 2026 — update if a new motorway station opens
// Source: goriva.si data cross-referenced with price deregulation (>€1.60)
export const MOTORWAY_PKS = new Set([
  // Petrol AC stations (37)
  777, 778, 781, 782, 790, 791, 793, 796, 823, 828, 837, 844, 845, 847, 848,
  861, 1559, 1568, 1923, 1945, 1949, 1976, 1977, 1978, 1997, 2000, 2008, 2009,
  2018, 2019, 2026, 2027, 2030, 2031, 2059, 2060, 2088,
  // MOL motorway stations (18) — don't use "AC" in name
  2089, 2095, 2096, 2100, 2101, 2120, 2123, 2141, 2162, 2175, 2176, 2201, 2202,
  2216, 2229, 2230, 2231, 2232,
]);

export function isMotorway(station: { pk: number }): boolean {
  return MOTORWAY_PKS.has(station.pk);
}
