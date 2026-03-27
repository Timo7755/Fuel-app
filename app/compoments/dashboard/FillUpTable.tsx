"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { FillUpEntry } from "@/lib/dashboard/types";
import EditFillUpModal from "./EditFillUpModal";
import type { Vehicle } from "@/lib/dashboard/types";
import { useRouter, useSearchParams } from "next/navigation";
import type { FuelType } from "@/lib/dashboard/types";

type Props = {
  data: FillUpEntry[];
  vehicles: Vehicle[];
  availableFuelTypes: FuelType[];
};

const FUEL_BADGE: Record<
  FillUpEntry["fuelType"],
  { label: string; className: string }
> = {
  PETROL_95: { label: "95", className: "bg-green-500/10 text-green-600" },
  PETROL_100: { label: "100", className: "bg-purple-500/10 text-purple-600" },
  DIESEL: { label: "D", className: "bg-yellow-500/10 text-yellow-600" },
  LPG: { label: "LPG", className: "bg-blue-500/10 text-blue-600" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function FillUpTable({
  data,
  vehicles,
  availableFuelTypes,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFuelType = searchParams.get("fuelType");

  function selectFuelType(ft: FuelType | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (ft) params.set("fuelType", ft);
    else params.delete("fuelType");
    router.push(`?${params.toString()}`);
  }

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<FillUpEntry | null>(null);

  async function handleDelete(id: number) {
    if (!confirm("Delete this fill-up?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/fillups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Fill-up deleted.");
      router.refresh();
    } catch {
      toast.error("Could not delete fill-up.");
    } finally {
      setDeletingId(null);
    }
  }

  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        No fill-ups found for this period.
      </p>
    );
  }

  return (
    <>
      {editingEntry && (
        <>
          {vehicles && vehicles.find((v) => v.id === editingEntry.vehicleId) ? (
            <EditFillUpModal
              vehicle={vehicles.find((v) => v.id === editingEntry.vehicleId)!}
              entry={editingEntry}
              onClose={() => setEditingEntry(null)}
            />
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card p-6 rounded-xl border">
                <p>Vehicle data not available. Please refresh.</p>
                <button
                  onClick={() => setEditingEntry(null)}
                  className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Fill-up History
          </h2>
          {availableFuelTypes.length > 1 && (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => selectFuelType(null)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition border ${
                  !currentFuelType
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                All
              </button>
              {availableFuelTypes.map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => selectFuelType(ft)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition border ${
                    currentFuelType === ft
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {FUEL_BADGE[ft].label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="hidden sm:grid sm:grid-cols-6 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Date</span>
            <span>Fuel</span>
            <span className="text-right">Liters</span>
            <span className="text-right">Cost</span>
            <span className="text-right">Odometer</span>
            {/* Mirror the row layout so €/L aligns with the value in rows */}
            <span className="flex justify-end items-center gap-1">
              €/L
              <span className="invisible flex gap-1">
                <span className="rounded p-1">
                  <span className="block h-3.5 w-3.5" />
                </span>
                <span className="rounded p-1">
                  <span className="block h-3.5 w-3.5" />
                </span>
              </span>
            </span>
          </div>

          {data.map((entry, i) => {
            const badge = FUEL_BADGE[entry.fuelType];
            const isDeleting = deletingId === entry.id;

            return (
              <div
                key={entry.id}
                className={`${i !== data.length - 1 ? "border-b border-border" : ""}
        ${i % 2 === 0 ? "bg-card" : "bg-muted/30"}
        ${isDeleting ? "opacity-50" : ""}`}
              >
                {/* ── MOBILE CARD (hidden on sm+) ── */}
                <div className="sm:hidden px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">
                        {formatDate(entry.date)}
                      </span>
                      {entry.isFullTank && (
                        <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-xs text-green-600">
                          Full
                        </span>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Liters</p>
                      <p className="tabular-nums font-medium">
                        {entry.liters.toFixed(2)} L
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className="tabular-nums font-medium">
                        {entry.totalCost.toFixed(2)} €
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">€/L</p>
                      <p className="tabular-nums font-medium">
                        {(entry.totalCost / entry.liters).toFixed(3)}
                      </p>
                    </div>
                  </div>

                  {entry.odometerKm !== null && (
                    <p className="text-xs text-muted-foreground">
                      Odometer: {entry.odometerKm.toLocaleString()} km
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* ── DESKTOP ROW (hidden on mobile) ── */}
                <div className="hidden sm:grid sm:grid-cols-6 gap-y-1 px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {formatDate(entry.date)}
                    </span>
                    {entry.isFullTank && (
                      <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-xs text-green-600">
                        Full
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex justify-end items-center">
                    <span className="tabular-nums">
                      {entry.liters.toFixed(2)} L
                    </span>
                  </div>
                  <div className="flex justify-end items-center">
                    <span className="tabular-nums">
                      {entry.totalCost.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-end items-center">
                    <span className="tabular-nums">
                      {entry.odometerKm !== null
                        ? `${entry.odometerKm.toLocaleString()} km`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-end items-center gap-1">
                    <span className="tabular-nums">
                      {(entry.totalCost / entry.liters).toFixed(3)} €/L
                    </span>
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="rounded p-1 text-muted-foreground transition hover:bg-blue-500/10 hover:text-blue-500"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={isDeleting}
                      className="rounded p-1 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
