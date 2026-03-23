"use client";

// Custom hook to manage the range mode (calendar or rolling)
import { useState, useEffect } from "react";

export type RangeMode = "calendar" | "rolling";

export function useRangeMode() {
  const [mode, setMode] = useState<RangeMode>("rolling");

  // Load saved preference from localStorage on mount

  useEffect(() => {
    const saved = localStorage.getItem("rangeMode") as RangeMode | null;
    if (saved === "calendar" || saved === "rolling") setMode(saved);
  }, []);

  function toggle() {
    setMode((prev) => {
      const next = prev === "rolling" ? "calendar" : "rolling";
      localStorage.setItem("rangeMode", next);
      return next;
    });
  }
  return { mode, toggle };
}
