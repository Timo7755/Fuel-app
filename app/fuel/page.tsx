import FuelPriceCard from "@/app/compoments/dashboard/FuelPriceCard";

export const dynamic = "force-dynamic";

export default function FuelPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Fuel Prices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live prices across Slovenia — local vs motorway
        </p>
      </div>
      <FuelPriceCard />
      {/* Map coming soon */}
    </main>
  );
}
