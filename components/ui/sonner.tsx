"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { useState, useEffect } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Handle mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use system theme during SSR
  const currentTheme = mounted ? theme : "system"

  return (
    <Sonner
      theme={currentTheme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
