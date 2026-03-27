"use client";

import { useEffect, useState } from "react";
import { X, Pencil, Trash2, Check, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Vehicle = {
  id: number;
  name: string;
  fuelCategory: "PETROL" | "DIESEL" | "LPG";
  hasLpg: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const FUEL_CATEGORIES = [
  { value: "PETROL", label: "Petrol" },
  { value: "DIESEL", label: "Diesel" },
  { value: "LPG", label: "LPG only" },
] as const;

type FuelCategory = (typeof FUEL_CATEGORIES)[number]["value"];

export default function ManageCarsModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editFuelCategory, setEditFuelCategory] =
    useState<FuelCategory>("PETROL");
  const [editHasLpg, setEditHasLpg] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteCount, setDeleteCount] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

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
    if (!isOpen) return;
    loadVehicles();
  }, [isOpen]);

  async function loadVehicles() {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles", { cache: "no-store" });
      const data = await res.json();
      setVehicles(data);
    } catch {
      toast.error("Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(v: Vehicle) {
    setEditingId(v.id);
    setEditName(v.name);
    setEditFuelCategory(v.fuelCategory);
    setEditHasLpg(v.hasLpg);
    setConfirmingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function saveEdit(id: number) {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          fuelCategory: editFuelCategory,
          hasLpg: editHasLpg,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Car updated!");
      setEditingId(null);
      await loadVehicles();
      router.refresh();
    } catch {
      toast.error("Failed to update car.");
    }
  }

  async function startDelete(id: number) {
    // Fetch fill-up count first to show in warning
    try {
      const res = await fetch(`/api/vehicles/${id}`);
      const data = await res.json();
      setDeleteCount(data.fillUpCount);
      setConfirmingId(id);
      setEditingId(null);
    } catch {
      toast.error("Failed to fetch vehicle data.");
    }
  }

  async function confirmDelete(id: number) {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Car deleted.");
      setConfirmingId(null);
      setDeleteCount(null);
      await loadVehicles();
      router.refresh();
    } catch {
      toast.error("Failed to delete car.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
      />

      <div className="relative z-10 w-full sm:max-w-md max-h-[90dvh] overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">My Cars</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Loading...
          </p>
        ) : vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No cars yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {vehicles.map((v) => (
              <li
                key={v.id}
                className="rounded-lg border border-border bg-background p-3 space-y-2"
              >
                {editingId === v.id ? (
                  // Edit mode
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/25"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {FUEL_CATEGORIES.map((fc) => (
                        <button
                          key={fc.value}
                          type="button"
                          onClick={() => {
                            setEditFuelCategory(fc.value);
                            if (fc.value === "LPG") setEditHasLpg(false);
                          }}
                          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition
        ${
          editFuelCategory === fc.value
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:bg-muted"
        }`}
                        >
                          {fc.label}
                        </button>
                      ))}
                    </div>
                    {editFuelCategory !== "LPG" && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editHasLpg}
                          onChange={(e) => setEditHasLpg(e.target.checked)}
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="text-sm text-foreground">
                          Also has LPG (bi-fuel)
                        </span>
                      </label>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(v.id)}
                        className="rounded-md p-1.5 text-green-600 hover:bg-green-500/10 transition"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : confirmingId === v.id ? (
                  // Delete confirmation
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-600">
                      ⚠️ Delete &quot;{v.name}&quot;?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This will permanently delete this car
                      {deleteCount !== null && deleteCount > 0
                        ? ` and all ${deleteCount} fill-up${deleteCount === 1 ? "" : "s"} associated with it.`
                        : "."}{" "}
                      This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(v.id)}
                        disabled={deletingId === v.id}
                        className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition disabled:opacity-50"
                      >
                        {deletingId === v.id
                          ? "Deleting..."
                          : "Delete everything"}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Normal view
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {v.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold
  ${
    v.fuelCategory === "DIESEL"
      ? "bg-yellow-500/10 text-yellow-600"
      : v.fuelCategory === "LPG"
        ? "bg-blue-500/10 text-blue-600"
        : "bg-green-500/10 text-green-600"
  }`}
                      >
                        {v.fuelCategory === "DIESEL"
                          ? "Diesel"
                          : v.fuelCategory === "LPG"
                            ? "LPG"
                            : "Petrol"}
                      </span>
                      {v.hasLpg && v.fuelCategory !== "LPG" && (
                        <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-600">
                          +LPG
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(v)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 transition"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startDelete(v.id)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
