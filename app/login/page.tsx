// The actual "sign in with Google" button needs to be a client component
// because it calls a NextAuth function on click

import { LoginButton } from "../compoments/auth/LoginButton";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Fuel Tracker
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Sign in to track your fuel costs
        </p>
        <LoginButton />
      </div>
    </main>
  );
}
