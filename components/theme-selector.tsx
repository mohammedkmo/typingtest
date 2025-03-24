'use client'

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

// Theme Selector Component
export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleThemeSelector = () => {
    setShowThemeSelector(!showThemeSelector)
  }

  const themes = [
    { name: "dark", label: "dark" },
    { name: "light", label: "light" },
    { name: "blue", label: "blue" },
    { name: "red", label: "red" },
    { name: "yellow", label: "yellow" },
    { name: "green", label: "green" },
    { name: "purple", label: "purple" },
  ]

  // Return a placeholder during SSR/before hydration
  if (!mounted) {
    return (
      <div className="">
        <div className="relative">
          <button className="text-xs uppercase tracking-wider px-2 py-1 text-neutral-400">
            theme
          </button>
        </div>
      </div>
    )
  }

  // Use a default theme if undefined
  const currentTheme = theme || "dark"
  
  return (
    <div className="">
      <div className="relative">
        <motion.button
          onClick={toggleThemeSelector}
          className={cn(
            "text-xs uppercase tracking-wider px-2 py-1",
            currentTheme === "dark"
              ? "text-neutral-600"
              : currentTheme === "light"
                ? "text-neutral-400"
                : currentTheme === "blue"
                  ? "text-blue-400"
                  : currentTheme === "red"
                    ? "text-red-400"
                    : currentTheme === "yellow"
                      ? "text-yellow-500"
                      : currentTheme === "green"
                        ? "text-green-400"
                        : currentTheme === "purple"
                          ? "text-purple-400"
                          : "text-neutral-400",
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showThemeSelector ? "close" : "theme"}
        </motion.button>

        <AnimatePresence>
          {showThemeSelector && (
            <motion.div
              initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 20, filter: "blur(8px)" }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute right-0 mt-2 flex flex-col items-end gap-1 p-2 border",
                currentTheme === "dark"
                  ? "bg-black border-neutral-800"
                  : currentTheme === "light"
                    ? "bg-white border-neutral-200"
                    : currentTheme === "blue"
                      ? "bg-blue-50 border-blue-200"
                      : currentTheme === "red"
                        ? "bg-red-50 border-red-200"
                        : currentTheme === "yellow"
                          ? "bg-yellow-50 border-yellow-200"
                          : currentTheme === "green"
                            ? "bg-green-50 border-green-200"
                            : currentTheme === "purple"
                              ? "bg-purple-50 border-purple-200"
                              : "bg-white border-neutral-200",
              )}
            >
              {themes.map((t, index) => (
                <motion.button
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className={cn(
                    "text-xs uppercase tracking-wider px-2 py-1",
                    currentTheme === t.name
                      ? t.name === "dark"
                        ? "text-white"
                        : t.name === "light"
                          ? "text-black"
                          : t.name === "blue"
                            ? "text-blue-600"
                            : t.name === "red"
                              ? "text-red-600"
                              : t.name === "yellow"
                                ? "text-yellow-600"
                                : t.name === "green"
                                  ? "text-green-600"
                                  : t.name === "purple"
                                    ? "text-purple-600"
                                    : "text-black"
                      : currentTheme === "dark"
                        ? "text-neutral-500"
                        : currentTheme === "light"
                          ? "text-neutral-400"
                          : currentTheme === "blue"
                            ? "text-blue-300"
                            : currentTheme === "red"
                              ? "text-red-300"
                              : currentTheme === "yellow"
                                ? "text-yellow-400"
                                : currentTheme === "green"
                                  ? "text-green-300"
                                  : currentTheme === "purple"
                                    ? "text-purple-300"
                                    : "text-neutral-400",
                  )}
                  initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05, // Stagger effect
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}