import VerificationForm from "./form"
import { Suspense } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verify Your Email",
  description: "Enter your verification code",
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
        <VerificationForm />
      </div>
    </Suspense>
  )
} 