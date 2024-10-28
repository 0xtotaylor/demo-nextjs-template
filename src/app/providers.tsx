"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { SkyfireProvider } from "@/lib/skyfire-sdk/context/context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SkyfireProvider>{children}</SkyfireProvider>
    </ThemeProvider>
  );
}
