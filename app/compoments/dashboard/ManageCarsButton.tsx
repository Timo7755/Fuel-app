"use client";

import { useState } from "react";
import { Car } from "lucide-react";
import ManageCarsModal from "./ManageCarsModal";

export default function ManageCarsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
      >
        <Car className="h-4 w-4" />
        <span>My Cars</span>
      </button>
      <ManageCarsModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
