"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, Car, LogOut, Fuel, BarChart2, UserCheck } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/app/compoments/dashboard/ui/ThemeToggle";
import ManageCarsModal from "@/app/compoments/dashboard/ManageCarsModal";
import { signOut } from "next-auth/react";

type Props = {
  name: string | null | undefined;
};

export default function NavbarMenu({ name }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [carsOpen, setCarsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <ManageCarsModal isOpen={carsOpen} onClose={() => setCarsOpen(false)} />

      {/* Desktop — inline buttons */}
      <div className="hidden sm:flex items-center gap-2">
        {name && (
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm"
          >
            👤 {name}
          </Link>
        )}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          <UserCheck className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/fuel"
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          <Fuel className="h-4 w-4" />
          Fuel Prices
        </Link>
        <Link
          href="/stats"
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          <BarChart2 className="h-4 w-4" />
          My Statistics
        </Link>
        <button
          type="button"
          onClick={() => setCarsOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted cursor-pointer"
        >
          <Car className="h-4 w-4" />
          My Cars
        </button>
        <LogoutButtonDesktop />
        <ThemeToggle />
      </div>

      {/* Mobile — hamburger */}
      <div className="flex sm:hidden items-center gap-2" ref={menuRef}>
        {name && (
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm"
          >
            👤 {name}
          </Link>
        )}
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-md border border-border bg-card p-1.5 text-foreground shadow-sm transition hover:bg-muted"
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {menuOpen && (
          <div className="absolute right-4 top-14 z-50 w-48 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
            >
              <UserCheck className="h-4 w-4" />
              Home
            </Link>
            <div className="border-t border-border" />

            <Link
              href="/fuel"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
            >
              <Fuel className="h-4 w-4" />
              Fuel Prices
            </Link>
            <div className="border-t border-border" />
            <Link
              href="/stats"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
            >
              <BarChart2 className="h-4 w-4" />
              My Stats
            </Link>
            <div className="border-t border-border" />

            <button
              type="button"
              onClick={() => {
                setCarsOpen(true);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
            >
              <Car className="h-4 w-4" />
              My Cars
            </button>
            <div className="border-t border-border" />
            <LogoutButtonMobile />
          </div>
        )}
      </div>
    </>
  );
}

function LogoutButtonDesktop() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}

function LogoutButtonMobile() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
