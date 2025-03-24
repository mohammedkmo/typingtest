import { quotes } from "@/lib/quotes"
import TypingTest from "@/components/typing-test"
import { Calistoga } from "next/font/google"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const calistoga = Calistoga({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
})

// Skeleton loader for the typing test
function TypingTestSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-28 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

export default function Home() {
  
  return (
    <main className="flex flex-col items-center justify-center bg-background">
      <div className="w-full container flex flex-col items-center gap-8">

        <div className="flex flex-col items-center gap-4 text-center max-w-2xl mx-auto mt-16">
          <h1 className={`text-5xl font-bold tracking-tighter text-primary ${calistoga.className}`}>
            Halfaya Typing Contest
          </h1>
          <p className="text-md text-muted-foreground leading-relaxed max-w-xl  font-light">
            Exclusive typing competition for PetroChina Halfaya employees. Test your typing speed and accuracy against your colleagues.
          </p>
        </div>

        <Suspense fallback={<TypingTestSkeleton />}>
          <TypingTest quotes={quotes} />
        </Suspense>
      </div>
    </main>
  )
}

