import ThemeToggle from "@/app/compoments/dashboard/ui/ThemeToggle";
import { auth } from "@/auth";
import NavbarMenu from "@/app/compoments/dashboard/NavbarMenu";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="relative w-full p-4">
      <div className="flex justify-end items-center gap-2">
        {session?.user ? (
          <NavbarMenu name={session.user.name} />
        ) : (
          <ThemeToggle />
        )}
      </div>
    </header>
  );
}
