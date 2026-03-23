"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddFillUpModal from "./AddFillUpModal";

type Props = {
  variant?: "full" | "compact";
};

export default function AddFillUpButton({ variant = "full" }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const buttonClassName =
    variant === "compact"
      ? "flex h-full w-full items-center justify-center px-4 py-3 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
      : "mx-auto flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 p-4 text-muted-foreground transition hover:bg-muted hover:text-foreground hover:cursor-pointer hover:scale-105";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonClassName}
        aria-label="Add fill-up"
      >
        <Plus className={variant === "compact" ? "h-6 w-6" : "h-5 w-5"} />
      </button>

      <AddFillUpModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
