"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import type { FillUpEntry, Vehicle } from "@/lib/dashboard/types";

type Props = {
  entry: FillUpEntry;
  vehicle: Vehicle;
  onClose: () => void;
};

const FUEL_TYPES = [
  { value: "PETROL_95", label: "Petrol 95" },
  { value: "PETROL_100", label: "Petrol 100" },
  { value: "DIESEL", label: "Diesel" },
  { value: "LPG", label: "LPG" },
] as const;

type FuelType = (typeof FUEL_TYPES)[number]["value"];

export default function EditFillUpModal({ entry, vehicle, onClose }: Props) {
  const router = useRouter();
  const allowedFuelTypes: FuelType[] =
    vehicle.fuelCategory === "LPG"
      ? ["LPG"]
      : vehicle.fuelCategory === "DIESEL"
        ? vehicle.hasLpg
          ? ["DIESEL", "LPG"]
          : ["DIESEL"]
        : vehicle.hasLpg
          ? ["PETROL_95", "PETROL_100", "LPG"]
          : ["PETROL_95", "PETROL_100"];

  // Pre-fill all fields with the existing entry data
  const [date, setDate] = useState(entry.date.slice(0, 10));
  const [liters, setLiters] = useState(String(entry.liters));
  const [totalCost, setTotalCost] = useState(String(entry.totalCost));
  const [odometerKm, setOdometerKm] = useState(
    entry.odometerKm !== null
      ? String(entry.odometerKm).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      : "",
  );
  const [isFullTank, setIsFullTank] = useState(entry.isFullTank);
  const [submitting, setSubmitting] = useState(false);
  const initialFuelType: FuelType = allowedFuelTypes.includes(entry.fuelType)
    ? entry.fuelType
    : (allowedFuelTypes[0] as FuelType);
  const [fuelType, setFuelType] = useState<FuelType>(initialFuelType);

  function handleOdometerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setOdometerKm(formatted);
  }

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const canSubmit = useMemo(
    () => !!date && Number(liters) > 0 && Number(totalCost) > 0 && !submitting,
    [date, liters, totalCost, submitting],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/fillups/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: `${date}T00:00:00.000Z`,
          liters: Number(liters),
          totalCost: Number(totalCost),
          odometerKm: odometerKm ? Number(odometerKm.replace(/\./g, "")) : null,
          isFullTank,
          fuelType,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to update fill-up");
      }

      toast.success("Fill-up updated.");
      onClose();
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update fill-up";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-2"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
      />

      <div className="relative z-10 w-full sm:max-w-md max-h-[95dvh] overflow-y-auto rounded-t-xl sm:rounded-xl border border-border bg-card p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Edit fill-up</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <span className="text-sm text-muted-foreground">Cost (EUR)</span>
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

          {/* Fuel type */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Fuel type</span>
            <div className="grid grid-cols-3 gap-2">
              {FUEL_TYPES.filter((ft) =>
                allowedFuelTypes.includes(ft.value as FuelType),
              ).map((ft) => (
                <button
                  key={ft.value}
                  type="button"
                  onClick={() => setFuelType(ft.value as FuelType)}
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
            <span className="text-sm text-muted-foreground">Odometer (km)</span>
            <input
              type="text"
              inputMode="numeric"
              value={odometerKm}
              onChange={handleOdometerChange}
              placeholder="example:100.000"
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
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
