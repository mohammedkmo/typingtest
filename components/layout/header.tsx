'use client'

import { signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession } from "next-auth/react"
import ThemeSelector from "@/components/theme-selector"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, User, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
// Header skeleton component for user profile
function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  )
}

// Mobile menu skeleton component
function MobileMenuSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 mb-6 bg-muted/50 rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  )
}

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileMenuOpen])

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <>
      <header className="w-full sticky top-0 z-40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between h-16 py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="typetest" width={32} height={32} priority />
              <span className="text-accent-foreground font-bold">Halfaya Typing Contest</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4">
            <ThemeSelector />

            <Link 
              href="/leaderboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              🥇 Leaderboard
            </Link>

            <Separator orientation="vertical" className="h-6" />

            {status === "loading" ? (
              <HeaderSkeleton />
            ) : status === "authenticated" ? (
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">Hi 👋 {session?.user?.name?.split(" ")[0]}</p>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage className="object-cover" src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                      <AvatarFallback className="text-xs">
                        {session?.user?.name ? getInitials(session?.user?.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{session?.user?.email || "user@example.com"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      // First call our custom signout endpoint to clear server-side session
                      await fetch('/api/auth/signout', { method: 'POST' })
                      // Then use NextAuth signOut
                      await signOut({ callbackUrl: '/' })
                    }}
                    className="cursor-pointer"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            ) : (
              <Button
                variant="ghost" 
                size="sm"
                onClick={() => signIn()}
                className="text-sm"
              >
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={toggleMobileMenu}
            className="sm:hidden p-2 hover:bg-accent/10 rounded-md transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-background border-l border-border/40 shadow-xl z-50 sm:hidden"
            >
              <div className="flex flex-col h-full overflow-y-auto py-6 px-4">
                {/* Close button in menu */}
                <div className="flex justify-end mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* User profile if authenticated or loading state */}
                {status === "loading" ? (
                  <MobileMenuSkeleton />
                ) : status === "authenticated" && (
                  <div className="flex items-center gap-3 p-3 mb-6 bg-muted/50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                      <AvatarFallback className="text-sm">
                        {session?.user?.name ? getInitials(session?.user?.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{session?.user?.email || "user@example.com"}</p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <nav className="flex flex-col gap-2 mb-6">
                  <Link 
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    Home
                  </Link>
                  
                  <Link 
                    href="/leaderboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    Leaderboard
                  </Link>
                  
                  {status === "authenticated" && (
                    <Link 
                      href="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  )}
                </nav>

                {/* Theme selector */}
                <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg mb-6">
                  <span className="text-sm">Theme</span>
                  <ThemeSelector />
                </div>

                {/* Authentication */}
                <div className="mt-auto pt-6 border-t">
                  {status === "authenticated" ? (
                    <Button 
                      variant="ghost"
                      size="lg"
                      onClick={async () => {
                        setMobileMenuOpen(false)
                        // First call our custom signout endpoint to clear server-side session
                        await fetch('/api/auth/signout', { method: 'POST' })
                        // Then use NextAuth signOut
                        await signOut({ callbackUrl: '/' })
                      }}
                      className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    >
                      Sign out
                    </Button>
                  ) : (
                    <Button
                      size="lg" 
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signIn()
                      }}
                      className="w-full"
                    >
                      Sign in
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}