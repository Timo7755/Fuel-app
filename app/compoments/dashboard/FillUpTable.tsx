"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { FillUpEntry } from "@/lib/dashboard/types";
import EditFillUpModal from "./EditFillUpModal";

type Props = { data: FillUpEntry[] };

const FUEL_BADGE: Record<
  FillUpEntry["fuelType"],
  { label: string; className: string }
> = {
  PETROL_95: { label: "95", className: "bg-green-500/10 text-green-600" },
  PETROL_100: { label: "100", className: "bg-purple-500/10 text-purple-600" },
  DIESEL: { label: "D", className: "bg-yellow-500/10 text-yellow-600" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function FillUpTable({ data }: Props) {
  const router = useRouter();
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
        <EditFillUpModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}

      <section className="mb-6">
        <h2 className="mb-2 text-center text-lg font-semibold tracking-tight">
          Fill-up History
        </h2>
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
                className={`grid grid-cols-2 sm:grid-cols-6 gap-y-1 px-4 py-3 text-sm
                  ${i !== data.length - 1 ? "border-b border-border" : ""}
                  ${i % 2 === 0 ? "bg-card" : "bg-muted/30"}
                  ${isDeleting ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1 mb-1 sm:mb-0">
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

                <div className="flex sm:justify-end items-center gap-0.5">
                  <span className="text-xs text-muted-foreground sm:hidden">
                    Liters:{" "}
                  </span>
                  <span className="tabular-nums text-foreground">
                    {entry.liters.toFixed(2)} L
                  </span>
                </div>

                <div className="flex sm:justify-end items-center gap-0.5">
                  <span className="text-xs text-muted-foreground sm:hidden">
                    Cost:{" "}
                  </span>
                  <span className="tabular-nums text-foreground">
                    {entry.totalCost.toFixed(2)} €
                  </span>
                </div>

                <div className="flex sm:justify-end items-center gap-0.5">
                  <span className="text-xs text-muted-foreground sm:hidden">
                    Odometer:{" "}
                  </span>
                  <span className="tabular-nums text-foreground">
                    {entry.odometerKm !== null
                      ? `${entry.odometerKm.toLocaleString()} km`
                      : "—"}
                  </span>
                </div>

                <div className="flex sm:justify-end items-center gap-1">
                  <span className="tabular-nums text-foreground">
                    {(entry.totalCost / entry.liters).toFixed(3)} €/L
                  </span>
                  <button
                    onClick={() => setEditingEntry(entry)}
                    className="rounded p-1 text-muted-foreground transition hover:bg-blue-500/10 hover:text-blue-500"
                    aria-label="Edit fill-up"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={isDeleting}
                    className="rounded p-1 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                    aria-label="Delete fill-up"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
