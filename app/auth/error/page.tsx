"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  // Function to get a user-friendly error message
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "OAuthAccountNotLinked":
        return "This email is already associated with another provider. Please sign in using the original provider you used.";
      case "AccessDenied":
        return "Access denied. You might not have permission to sign in.";
      case "Verification":
        return "The verification link has expired or has already been used.";
      case "Configuration":
        return "There is a server configuration error. Please contact support.";
      default:
        return "An unexpected authentication error occurred. Please try again.";
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="absolute inset-0 bg-grid-small-black/[0.2] bg-[length:20px_20px] opacity-20" />
      
      <div className="container relative flex flex-col items-center justify-center lg:px-0">
        <motion.div
          className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center space-y-2 text-center">
            <Link href="/" className="mb-6 inline-block">
              <Image 
                src="/logo.png" 
                alt="Typing Test Logo" 
                width={48} 
                height={48}
                className="h-12 w-12"
              />
            </Link>
            
            <motion.div 
              className="flex items-center justify-center rounded-full bg-red-100 p-3 dark:bg-red-900/20"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </motion.div>
            
            <h1 className="text-2xl font-semibold tracking-tight">Authentication Error</h1>
            
            <p className="text-sm text-muted-foreground max-w-xs">
              {getErrorMessage(error)}
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-xs font-medium text-muted-foreground">Error code: {error || "unknown"}</p>
            </div>

            <div className="flex flex-col space-y-2">
              <Link href="/auth/signin">
                <Button 
                  variant="default" 
                  className="w-full flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                  Back to Sign In
                </Button>
              </Link>
              
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
