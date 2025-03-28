import SignInForm from "./form"
import { Suspense } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className="absolute inset-0 bg-grid-small-black/[0.2] bg-[length:20px_20px] opacity-20" />
        <SignInForm />
      </div>
    </Suspense>
  )
} 