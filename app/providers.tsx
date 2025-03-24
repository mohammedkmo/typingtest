"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        themes={["light", "dark", "blue", "red", "yellow", "green", "purple"]}
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
} 