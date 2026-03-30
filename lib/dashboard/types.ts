import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export type Summary = {
  range: string;
  totalFuelCost: number;
  totalLiters: number;
  distanceKm: number | null;
  litersPerKm: number | null;
  costPerKm: number | null;
  fillUpsCount: number;
  consumptionNote: string | null;
};

export type Vehicle = {
  id: number;
  name: string;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  fuelCategory: "PETROL" | "DIESEL" | "LPG";
  hasLpg: boolean;
};

export type FuelType = "PETROL_95" | "PETROL_100" | "DIESEL" | "LPG";

export type FillUpEntry = {
  id: number;
  date: string;
  liters: number;
  totalCost: number;
  odometerKm: number | null;
  isFullTank: boolean;
  fuelType: FuelType;
  vehicleId: number;
};

export type DashboardData = {
  summary: Summary;
  fillUps: FillUpEntry[];
  vehicles: Vehicle[];
  availableFuelTypes: FuelType[];
};
