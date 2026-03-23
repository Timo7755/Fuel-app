"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const FUEL_CATEGORIES = [
  { value: "PETROL", label: "Petrol" },
  { value: "DIESEL", label: "Diesel" },
] as const;

type FuelCategory = (typeof FUEL_CATEGORIES)[number]["value"];

export default function AddVehicleModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState("");
  const [fuelCategory, setFuelCategory] = useState<FuelCategory>("PETROL");
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

  function resetForm() {
    setName("");
    setFuelCategory("PETROL");
    setError(null);
    setSubmitting(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          fuelCategory,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to create vehicle");
      }
      toast.success("Vehicle added!");
      resetForm();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create vehicle";
      toast.error(msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    // Outer: fullscreen backdrop + positioning
    <div
      className="fixed inset-0 z-[60] flex items-center p-2 justify-center sm:items-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-vehicle-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full sm:max-w-md max-h-[95dvh] overflow-y-auto rounded-t-xl sm:rounded-xl border border-border bg-card p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="add-vehicle-title"
            className="text-xl font-semibold tracking-tight"
          >
            Add vehicle
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Name <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Golf"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none transition focus:ring-2 focus:ring-primary/25"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Fuel type</span>
            <div className="grid grid-cols-2 gap-2">
              {FUEL_CATEGORIES.map((fc) => (
                <button
                  key={fc.value}
                  type="button"
                  onClick={() => setFuelCategory(fc.value)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition
                    ${
                      fuelCategory === fc.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                >
                  {fc.label}
                </button>
              ))}
            </div>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Add vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
