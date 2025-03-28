'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Calistoga } from "next/font/google"
import { ArrowLeft, CheckCircle, Mail } from "lucide-react"

const calistoga = Calistoga({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
})

const DOMAIN = "@petrochina-hfy.com"

export default function SignInForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [emailPrefix, setEmailPrefix] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [registrationSuccess, setRegistrationSuccess] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
  
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
  
      try {
        // Send verification code
        const response = await fetch("/api/auth/send-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            isRegistration: false // This is a sign-in, not registration
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to send verification code");
        }
  
        setEmailSent(true)
        setIsLoading(false)
        
        // Redirect to verification page
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
        setIsLoading(false)
      }
    }


  return (
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
          {emailSent ? "Check your email" : "Welcome back"}
        </motion.h1>
        
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {emailSent 
            ? "We've sent you a verification code to sign in" 
            : "Sign in to your account to continue"}
        </motion.p>
      </div>

      <AnimatePresence>
        {registrationSuccess && (
          <motion.div 
            className="flex items-center gap-2 text-sm text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>Account created successfully! Check your email for a verification code.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="grid gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {emailSent ? (
          <div className="text-center space-y-4">
            <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm">We've sent a verification code to:</p>
              <p className="font-medium">{email}</p>
            </div>
            
            <p className="text-xs text-muted-foreground">
              The code will expire in 10 minutes. If you don't see it, check your spam folder.
            </p>

            <Link href={`/auth/verify?email=${encodeURIComponent(email)}`}>
              <Button className="w-full mt-4">
                Enter Verification Code
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => {
                setEmailSent(false)
                setEmailPrefix("")
              }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
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
                    className="h-10 rounded-md bg-input border border-input px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 pr-[160px]"
                    value={emailPrefix}
                    onChange={handleEmailChange}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    {DOMAIN}
                  </div>
                </div>
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
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-foreground" />
                ) : (
                  <>Send Verification Code</>
                )}
              </Button>
            </div>
          </form>
        )}

        {!emailSent && (
          <div className="flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                href="/auth/register" 
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </span>
          </div>
        )}

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
        By signing in, you agree to our{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </Link>.
      </motion.p>
    </div>
  </div>
  )
}