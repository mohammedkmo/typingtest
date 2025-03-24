"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { Calistoga } from "next/font/google"

const calistoga = Calistoga({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
})

const DOMAIN = "@petrochina-hfy.com"

export default function Register() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [emailPrefix, setEmailPrefix] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Full email with domain
  const email = `${emailPrefix}${DOMAIN}`

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any @ symbol and anything after it
    const value = e.target.value.split('@')[0];
    
    // Remove any special characters except alphanumeric, dots, underscores, and hyphens
    const sanitizedValue = value.replace(/[^a-zA-Z0-9._-]/g, '');
    
    setEmailPrefix(sanitizedValue);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailPrefix) {
      setError("Email is required")
      return
    }
    
    setIsLoading(true)
    setError(null)

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register")
      }

      // Redirect to sign in page after successful registration
      router.push("/auth/signin?registered=true")
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Something went wrong. Please try again.")
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="absolute inset-0 bg-grid-small-black/[0.2] bg-[length:20px_20px] opacity-20" />
      
      <div className="container relative flex flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="mb-2 inline-block">
              <Image src="/logo.png" alt="typetest" width={50} height={50} />
            </Link>
            
            <motion.h1 
              className={`text-2xl font-semibold tracking-tight ${calistoga.className}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Create an account
            </motion.h1>
            
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Join our typing community
            </motion.p>
          </div>

          <motion.div 
            className="grid gap-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="sr-only">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Name"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="h-10 rounded-md border border-input bg-input px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="text"
                      placeholder="Email username"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      className="h-10 rounded-md border border-input bg-input px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 pr-[160px]"
                      value={emailPrefix}
                      onChange={handleEmailChange}
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      {DOMAIN}
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    className="h-10 rounded-md border border-input bg-input px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="confirm-password" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm Password"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    className="h-10 rounded-md border border-input bg-input px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <motion.div 
                    className="text-sm text-red-500 bg-red-500/10 p-2 rounded-md"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {error}
                  </motion.div>
                )}
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full flex items-center justify-center gap-2 group transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  ) : (
                    <>Create Account</>
                  )}
                </Button>
              </div>
            </form>

            <div className="flex items-center justify-center">
              <span className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  href="/auth/signin" 
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </span>
            </div>

            <div className="mt-4">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.p 
            className="text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            By creating an account, you agree to our{" "}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </motion.p>
        </div>
      </div>
    </div>
  )
} 