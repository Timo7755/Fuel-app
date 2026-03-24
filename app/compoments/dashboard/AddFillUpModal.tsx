"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import AddVehicleModal from "./AddVehicleModal";
import type { Vehicle } from "@/lib/dashboard/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const FUEL_TYPES = [
  { value: "PETROL_95", label: "Petrol 95" },
  { value: "PETROL_100", label: "Petrol 100" },
  { value: "DIESEL", label: "Diesel" },
] as const;

type FuelType = (typeof FUEL_TYPES)[number]["value"];

type FuelRates = {
  petrol95: number | null;
  diesel: number | null;
  petrol100: number | null;
  lpg: number | null;
  stationCount: number;
};

// Helper function to get the today's date
function getTodayDateInputValue() {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

// Main component
export default function AddFillUpModal({ isOpen, onClose, onSuccess }: Props) {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehicleId, setVehicleId] = useState("");
  const [date, setDate] = useState(getTodayDateInputValue());
  const [liters, setLiters] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [odometerKm, setOdometerKm] = useState("");
  const [isFullTank, setIsFullTank] = useState(true);
  const [fuelType, setFuelType] = useState<FuelType>("PETROL_95");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  // State for fuel rates
  const [fuelRates, setFuelRates] = useState<{
    local: FuelRates;
    motorway: FuelRates;
  } | null>(null);
  const [isMotorway, setIsMotorway] = useState(false);
  const [focused, setFocused] = useState<"liters" | "cost" | null>(null);
  const [autoCalc, setAutoCalc] = useState(true);

  // Effect to fetch fuel rates
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/fuel-prices")
      .then((res) => res.json())
      .then((data) => setFuelRates(data.averages))
      .catch(console.error);
  }, [isOpen]);

  // Memoized function to get the current rate
  const currentRate = useMemo(() => {
    if (!fuelRates) return null;
    const pool = isMotorway ? fuelRates.motorway : fuelRates.local;
    if (!pool) return null;
    if (fuelType === "PETROL_95") return pool.petrol95;
    if (fuelType === "PETROL_100") return pool.petrol100;
    if (fuelType === "DIESEL") return pool.diesel;
    return null;
  }, [fuelRates, isMotorway, fuelType]);

  // Effect to calculate the total cost or liters
  useEffect(() => {
    if (!currentRate || !autoCalc) return;
    if (focused === "liters") {
      const num = Number(liters);
      if (liters === "" || isNaN(num) || num <= 0) {
        setTotalCost("");
      } else {
        setTotalCost((num * currentRate).toFixed(2));
      }
    } else if (focused === "cost") {
      const num = Number(totalCost);
      if (totalCost === "" || isNaN(num) || num <= 0) {
        setLiters("");
      } else {
        setLiters((num / currentRate).toFixed(2));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liters, totalCost, currentRate, autoCalc]);

  // Effect to reset the form when the modal is closed
  useEffect(() => {
    if (!isOpen) return;
    setLiters("");
    setTotalCost("");
    setOdometerKm("");
    setDate(getTodayDateInputValue());
    setIsFullTank(true);
    setIsMotorway(false);
    setAutoCalc(true);
    setFocused(null);
    setError(null);
  }, [isOpen]);

  // Effect to handle the escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Effect to handle the body overflow
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Effect to load the vehicles
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
          setError("Can't load vehicles.");
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

  // Effect to set the fuel type
  useEffect(() => {
    const selected = vehicles.find((v) => String(v.id) === vehicleId);
    if (!selected) return;
    setFuelType(selected.fuelCategory === "DIESEL" ? "DIESEL" : "PETROL_95");
  }, [vehicleId, vehicles]);

  // Function to reload the vehicles
  async function reloadVehicles() {
    const res = await fetch("/api/vehicles", { cache: "no-store" });
    const data = (await res.json()) as Vehicle[];
    setVehicles(data);
    if (data.length > 0) setVehicleId(String(data[data.length - 1].id));
  }

  // Memoized function to check if the form can be submitted
  const canSubmit = useMemo(
    () =>
      !!vehicleId &&
      !!date &&
      Number(liters) > 0 &&
      Number(totalCost) > 0 &&
      !submitting,
    [vehicleId, date, liters, totalCost, submitting],
  );

  // Function to handle the form submission
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
        fuelType,
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
      onSuccess?.();
      setLiters("");
      setTotalCost("");
      setOdometerKm("");
      setDate(getTodayDateInputValue());
      setFuelType("PETROL_95");
      setIsMotorway(false);
      setAutoCalc(true);
      setFocused(null);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create fill-up";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Memoized function to get the selected vehicle
  const selectedVehicle = vehicles.find((v) => String(v.id) === vehicleId);
  const filteredFuelTypes = FUEL_TYPES.filter((ft) => {
    if (!selectedVehicle) return true;
    if (selectedVehicle.fuelCategory === "DIESEL") return ft.value === "DIESEL";
    return ft.value === "PETROL_95" || ft.value === "PETROL_100";
  });

  // If the modal is not open, return null
  if (!isOpen) return null;

  return (
    <>
      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={addVehicleOpen}
        onClose={async () => {
          setAddVehicleOpen(false);
          await reloadVehicles();
        }}
      />

      {/* Add Fill Up Modal */}
      <div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-fillup-title"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-label="Close"
        />

        {/* Modal content */}
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

          {/* Loading vehicles */}
          {loadingVehicles ? (
            <p className="text-sm text-muted-foreground">Loading vehicles...</p>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                You need at least one vehicle before adding a fill-up.
              </p>
              <button
                type="button"
                onClick={() => setAddVehicleOpen(true)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                + Add your first vehicle
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle */}
              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Car</span>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-foreground text-center outline-none transition focus:ring-2 focus:ring-primary/25"
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
                <button
                  type="button"
                  onClick={() => setAddVehicleOpen(true)}
                  className="mt-1 text-xs text-primary transition sm:self-start sm:hover:underline w-full rounded-md border border-primary px-3 py-2 text-sm font-medium hover:bg-primary/10 sm:w-auto sm:rounded-none sm:border-0 sm:p-0 sm:text-xs sm:font-normal sm:hover:bg-transparent"
                >
                  + Add new vehicle
                </button>
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

              {/* Motorway toggle */}
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-muted-foreground">Motorway</span>
                <div className="flex items-center gap-2">
                  {currentRate && (
                    <span className="text-xs text-muted-foreground">
                      avg {currentRate.toFixed(3)}€ /L
                    </span>
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isMotorway}
                    onClick={() => setIsMotorway((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isMotorway ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        isMotorway ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Auto-calc toggle */}
              <div className="flex items-center justify-center gap-10">
                <span className="text-sm text-muted-foreground">
                  Auto-calculate
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoCalc}
                  onClick={() => setAutoCalc((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoCalc ? "bg-primary" : "bg-muted"
                  } ml-7`} // ml-7 to offset / custom space to align both toggles !!!
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      autoCalc ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Liters + Cost */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Liters</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={liters}
                    onFocus={(e) => {
                      setFocused("liters");
                      e.target.select();
                    }}
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
                    onFocus={(e) => {
                      setFocused("cost");
                      e.target.select();
                    }}
                    onChange={(e) => setTotalCost(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-right tabular-nums text-foreground outline-none transition focus:ring-2 focus:ring-primary/25"
                    required
                  />
                </label>
              </div>

              {/* Fuel Type */}
              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Fuel type</span>
                <div
                  className={`grid gap-2 ${filteredFuelTypes.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                >
                  {filteredFuelTypes.map((ft) => (
                    <button
                      key={ft.value}
                      type="button"
                      onClick={() => setFuelType(ft.value)}
                      className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
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
                  Odometer Km (optional)
                </span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-center tabular-nums text-foreground outline-none transition focus:ring-2 focus:ring-primary/25"
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
    </>
  );
}
