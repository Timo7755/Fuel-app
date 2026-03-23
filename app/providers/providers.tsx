"use client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "10px",
            border: "1px solid rgb(191 219 254)",
            background: "rgb(255 255 255)",
            color: "rgb(15 23 42)",
          },
        }}
      />
    </ThemeProvider>
  );
}
