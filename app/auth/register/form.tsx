'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Calistoga } from "next/font/google"
import { signIn } from "next-auth/react"

const calistoga = Calistoga({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
})



const DOMAIN = "@petrochina-hfy.com"
export default function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [emailPrefix, setEmailPrefix] = useState("")
  const [department, setDepartment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registrationComplete, setRegistrationComplete] = useState(false)

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

    if (!name) {
      setError("Name is required")
      return
    }

    if (!department) {
      setError("Department is required")
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      // Create user in database
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          department,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register")
      }

      // Send sign-in email
      const result = await signIn("email", {
        email,
        redirect: false,
      })

      if (result?.error) {
        throw new Error("Failed to send login email")
      }

      setRegistrationComplete(true)
      setIsLoading(false)

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
          {registrationComplete ? "Check your email" : "Create an account"}
        </motion.h1>
        
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {registrationComplete 
            ? "We've sent you a magic link to sign in" 
            : "Join our typing community"}
        </motion.p>
      </div>

      <motion.div 
        className="grid gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {registrationComplete ? (
          <div className="text-center space-y-4">
            <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm">We've sent a sign-in link to:</p>
              <p className="font-medium">{email}</p>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Click the link in the email to verify your account and sign in. The link will expire in 10 minutes.
            </p>
          </div>
        ) : (
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
                <label htmlFor="department" className="sr-only">
                  Department
                </label>
                <input
                  id="department"
                  type="text"
                  placeholder="Department"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="h-10 rounded-md border border-input bg-input px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
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
                  <>Register</>
                )}
              </Button>
            </div>
          </form>
        )}

        {!registrationComplete && (
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
    </div>
  )
}