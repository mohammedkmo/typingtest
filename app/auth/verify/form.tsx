'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Loader2, AlertCircle, RefreshCw, Clock, Inbox } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"
import { Calistoga } from "next/font/google"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Progress } from "@/components/ui/progress"

const calistoga = Calistoga({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
})

export default function VerificationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  
  // Initialize the timer when component mounts
  useEffect(() => {
    // Check if there's a stored timestamp for when the code was sent
    const codeSentTime = localStorage.getItem('codeSentTime')
    if (codeSentTime) {
      const elapsedSeconds = Math.floor((Date.now() - parseInt(codeSentTime)) / 1000)
      const remainingSeconds = Math.max(0, 120 - elapsedSeconds)
      
      if (remainingSeconds > 0) {
        setCountdown(remainingSeconds)
        setTimerActive(true)
      }
    }
  }, [])
  
  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prevCountdown) => {
          const newValue = prevCountdown - 1
          if (newValue <= 0) {
            clearInterval(interval)
            setTimerActive(false)
            return 0
          }
          return newValue
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, countdown])
  
  // Format the countdown as mm:ss
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (verificationCode.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }
    
    if (!/^\d{6}$/.test(verificationCode)) {
      setError("Code must contain 6 digits")
      return
    }
    
    setIsLoading(true)
    
    try {
      // Use the credentials provider to sign in
      const result = await signIn("email-code", {
        email: email,
        code: verificationCode,
        redirect: false,
        callbackUrl: "/",
      });
      
      console.log("Sign-in result:", result);
      
      if (result?.error) {
        setError("Invalid or expired verification code")
        setIsLoading(false)
      } else if (result?.ok && result?.url) {
        toast({
          title: "Success!",
          description: "You've successfully signed in",
        })
        
        // Redirect to the callback URL or dashboard
        router.push(result.url)
      } else {
        // Handle unexpected response
        setError("Verification failed. Please try again.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("An error occurred during verification")
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    if (!email) {
      setError("Email is required to resend the code")
      return
    }
    
    if (timerActive) {
      toast({
        title: "Please wait",
        description: `You can request a new code in ${formatCountdown()}`,
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Send verification code
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }
      
      toast({
        title: "Code resent!",
        description: "A new verification code has been sent to your email",
      })
      
      // Store the current timestamp
      localStorage.setItem('codeSentTime', Date.now().toString())
      
      // Start the countdown timer
      setCountdown(120)
      setTimerActive(true)
      
      // Clear the current verification code field
      setVerificationCode("")
      setIsLoading(false)
    } catch (error) {
      console.error("Resend code error:", error)
      setError(error instanceof Error ? error.message : "Failed to resend code")
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] px-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <Link href="/" className="mb-4 inline-block">
          <Image src="/logo.png" alt="typetest" width={50} height={50} />
        </Link>
        
        <h1 className={`text-2xl font-semibold tracking-tight ${calistoga.className}`}>
          Verify Your Email
        </h1>
        
        <p className="text-muted-foreground text-sm">
          Enter the 6-digit code sent to {email ? email : "your email"}
        </p>
      </div>
      
      <Card className="border border-border/40 bg-background/60 backdrop-blur border-none shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Verification Code</CardTitle>
          <CardDescription>
            Enter the code from your email to sign in
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-14 w-12 text-center text-lg font-semibold" />
                  <InputOTPSlot index={1} className="h-14 w-12 text-center text-lg font-semibold" />
                  <InputOTPSlot index={2} className="h-14 w-12 text-center text-lg font-semibold" />
                  <InputOTPSlot index={3} className="h-14 w-12 text-center text-lg font-semibold" />
                  <InputOTPSlot index={4} className="h-14 w-12 text-center text-lg font-semibold" />
                  <InputOTPSlot index={5} className="h-14 w-12 text-center text-lg font-semibold" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <Alert className="bg-muted/50 border-muted py-2">
              <Inbox className="h-4 w-4 text-muted-foreground" />
              <AlertDescription className="text-xs text-muted-foreground">
                Don't see the code? Please check your spam or junk folder.
              </AlertDescription>
            </Alert>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 pt-0">
          {timerActive && countdown > 0 ? (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>Resend available in {formatCountdown()}</span>
              </div>
              <Progress value={(countdown / 120) * 100} className="h-1" />
            </div>
          ) : (
            <div className="text-center w-full">
              <button
                type="button"
                onClick={resendCode}
                className="text-xs text-muted-foreground hover:text-primary flex items-center justify-center mx-auto"
                disabled={isLoading || timerActive}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Resend Code
              </button>
            </div>
          )}
          
          <div className="flex justify-center w-full">
            <Link href="/auth/signin" className="text-xs text-muted-foreground hover:text-primary">
              Try another method
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
} 