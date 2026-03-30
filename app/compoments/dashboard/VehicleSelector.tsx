"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, Car } from "lucide-react";

type Vehicle = {
  id: number;
  name: string;
};

export default function VehicleSelector() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentVehicleId = searchParams.get("vehicleId");
  const currentRange = searchParams.get("range") ?? "1M";
  const currentMode = searchParams.get("mode") ?? "rolling";

  const selectedVehicle = vehicles.find(
    (v) => String(v.id) === currentVehicleId,
  );

  useEffect(() => {
    fetch("/api/vehicles", { cache: "no-store" })
      .then((r) => r.json())
      .then(setVehicles)
      .catch(console.error);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (vehicles.length <= 1) return null;

  function select(vehicleId: string | null) {
    const params = new URLSearchParams();
    params.set("range", currentRange);
    params.set("mode", currentMode);
    if (vehicleId) params.set("vehicleId", vehicleId);
    router.push(`?${params.toString()}`);
    setOpen(false);

    fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        preferredVehicleId: vehicleId ? Number(vehicleId) : null,
      }),
    }).catch(console.error);
  }

  return (
    <div className="mb-4 flex justify-center">
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          <Car className="h-4 w-4 text-muted-foreground" />
          {selectedVehicle ? selectedVehicle.name : "All Cars"}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-48 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-10">
            {/* All Cars option */}
            <button
              type="button"
              onClick={() => select(null)}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition
                ${
                  !currentVehicleId
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
            >
              All Cars
            </button>

            <div className="border-t border-border" />

            {vehicles.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => select(String(v.id))}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition
                  ${
                    currentVehicleId === String(v.id)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
