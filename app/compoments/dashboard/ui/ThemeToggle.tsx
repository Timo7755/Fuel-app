"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SunMedium, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground opacity-70"
        disabled
      >
        Theme
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground transition hover:bg-muted"
      type="button"
    >
      {theme === "dark" ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
