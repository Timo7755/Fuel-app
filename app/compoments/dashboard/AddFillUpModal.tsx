"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import toast from "react-hot-toast";

type Vehicle = {
  id: number;
  name: string;
  brand: string | null;
  model: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const FUEL_TYPES = [
  { value: "PETROL_95", label: "Petrol 95" },
  { value: "PETROL_100", label: "Petrol 100" },
  { value: "DIESEL", label: "Diesel" },
] as const;

type FuelType = (typeof FUEL_TYPES)[number]["value"];

function getTodayDateInputValue() {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

export default function AddFillUpModal({ isOpen, onClose }: Props) {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehicleId, setVehicleId] = useState("");
  const [date, setDate] = useState(getTodayDateInputValue());
  const [liters, setLiters] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [odometerKm, setOdometerKm] = useState("");
  const [isFullTank, setIsFullTank] = useState(true);
  const [fuelType, setFuelType] = useState<FuelType>("PETROL_95"); // NEW
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    let ignore = false;
    async function loadVehicles() {
      try {
        setLoadingVehicles(true);
        const res = await fetch("/api/vehicles", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        const data = (await res.json()) as Vehicle[];
        if (!ignore) {
          setVehicles(data);
          if (data.length > 0) setVehicleId(String(data[0].id));
        }
      } catch (e) {
        if (!ignore) {
          setError("Can't load vehicles. Check /api/vehicles endpoint.");
          console.error(e);
        }
      } finally {
        if (!ignore) setLoadingVehicles(false);
      }
    }
    loadVehicles();
    return () => {
      ignore = true;
    };
  }, []);

  const canSubmit = useMemo(
    () =>
      !!vehicleId &&
      !!date &&
      Number(liters) > 0 &&
      Number(totalCost) > 0 &&
      !submitting,
    [vehicleId, date, liters, totalCost, submitting],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Please fill required fields.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        vehicleId: Number(vehicleId),
        date: `${date}T00:00:00.000Z`,
        liters: Number(liters),
        totalCost: Number(totalCost),
        odometerKm: odometerKm ? Number(odometerKm) : undefined,
        isFullTank,
        fuelType, // NEW
      };
      const res = await fetch("/api/fillups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to create fill-up");
      }
      toast.success("Fill-up added successfully.");
      onClose();
      setLiters("");
      setTotalCost("");
      setOdometerKm("");
      setDate(getTodayDateInputValue());
      setFuelType("PETROL_95");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create fill-up";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-fillup-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
      />

      <div className="relative z-10 w-full sm:max-w-md max-h-[95dvh] overflow-y-auto rounded-t-xl sm:rounded-xl border border-border bg-card p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="add-fillup-title"
            className="text-xl font-semibold tracking-tight"
          >
            New fill-up
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loadingVehicles ? (
          <p className="text-sm text-muted-foreground">Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No vehicles found. Create one via <code>/api/vehicles</code> first.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehicle */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Car</span>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none transition focus:ring-2 focus:ring-primary/25"
                required
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                    {v.brand ? ` - ${v.brand}` : ""}
                    {v.model ? ` ${v.model}` : ""}
                  </option>
                ))}
              </select>
            </label>

            {/* Date */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none transition focus:ring-2 focus:ring-primary/25"
                required
              />
            </label>

            {/* Liters + Cost */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Liters</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-right tabular-nums text-foreground outline-none transition focus:ring-2 focus:ring-primary/25"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  Cost (EUR)
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-right tabular-nums text-foreground outline-none transition focus:ring-2 focus:ring-primary/25"
                  required
                />
              </label>
            </div>

            {/* Fuel Type */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Fuel type</span>
              <div className="grid grid-cols-3 gap-2">
                {FUEL_TYPES.map((ft) => (
                  <button
                    key={ft.value}
                    type="button"
                    onClick={() => setFuelType(ft.value)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition
                      ${
                        fuelType === ft.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                  >
                    {ft.label}
                  </button>
                ))}
              </div>
            </label>

            {/* Odometer */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">
                Odometer (km)
              </span>
              <input
                type="number"
                step="0.1"
                min="0"
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-right tabular-nums text-foreground outline-none transition focus:ring-2 focus:ring-primary/25"
              />
            </label>

            {/* Full tank + Submit */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFullTank}
                  onChange={(e) => setIsFullTank(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-foreground">Full tank</span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Add fill-up"}
              </button>
            </div>
          </form>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
