'use client'

import { motion } from "framer-motion"
import { Inbox, ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Calistoga } from "next/font/google"

const calistoga = Calistoga({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
})

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="absolute inset-0 bg-grid-small-black/[0.2] bg-[length:20px_20px] opacity-20" />
      
      <motion.div
        className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-4 inline-block">
            <Image src="/logo.png" alt="typetest" width={50} height={50} />
          </Link>
          
          <motion.div
            className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Mail className="h-10 w-10 text-primary" />
          </motion.div>
          
          <h1 className={`text-2xl font-semibold tracking-tight mb-2 ${calistoga.className}`}>
            Check your email
          </h1>
          
          <p className="text-muted-foreground max-w-sm mx-auto">
            A sign in link has been sent to your email address. 
            Please check your inbox and click the link to sign in.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="p-5 rounded-lg bg-muted/40 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <Inbox className="h-4 w-4" />
              <span>The link will expire in 10 minutes</span>
            </div>
            
            <p className="text-xs text-muted-foreground">
              If you don't see the email in your inbox, check your spam folder.
              The email will come from <span className="font-medium text-foreground">{process.env.NEXT_PUBLIC_EMAIL_FROM || 'noreply@mohammedk.me'}</span>
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Link href="/auth/signin">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 group"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Back to Sign In
              </Button>
            </Link>
            
            <Link href="/">
              <Button 
                variant="ghost" 
                className="w-full"
              >
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 