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
};

// Each row in the history table
export type FillUpEntry = {
  id: number;
  date: string;
  liters: number;
  totalCost: number;
  odometerKm: number | null;
  isFullTank: boolean;
  fuelType: "PETROL_95" | "PETROL_100" | "DIESEL";
};

export type DashboardData = {
  summary: Summary;
  fillUps: FillUpEntry[];
};
