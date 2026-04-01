import ThemeToggle from "@/app/compoments/dashboard/ui/ThemeToggle";
import { auth } from "@/auth";
import NavbarMenu from "@/app/compoments/dashboard/NavbarMenu";
import Link from "next/link";
import { Fuel } from "lucide-react";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="relative w-full p-4">
      <div className="flex justify-end items-center gap-2">
        {session?.user ? (
          <NavbarMenu name={session.user.name} />
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/fuel"
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
            >
              <Fuel className="h-4 w-4" />
              Fuel Prices
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
            >
              Sign in
            </Link>
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
}
