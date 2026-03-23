import ThemeToggle from "@/app/compoments/dashboard/ui/ThemeToggle";
import { LogoutButton } from "@/app/compoments/auth/LogoutButton";
import { auth } from "@/auth";

export default async function Navbar() {
  const session = await auth(); // fetch session on the server

  return (
    <header className="relative w-full p-4">
      <div className="flex justify-end gap-2">
        <ThemeToggle />
        {session?.user && <LogoutButton />}
      </div>
    </header>
  );
}
