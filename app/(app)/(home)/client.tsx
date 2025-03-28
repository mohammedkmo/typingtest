'use client'

import { quotes } from "@/lib/quotes"
import TypingTest from "@/components/typing-test"
import { Calistoga } from "next/font/google"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    LogIn,
    UserPlus,
    UserRoundCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

function Video() {




    return (
        <div className="w-full max-w-3xl mx-auto overflow-hidden border border-border p-2 -mt-8" style={{ borderRadius: "1rem" }}>

          
            <video
                className="object-cover w-full h-full scale-110"
                preload="auto"
                autoPlay={true}
                muted={true}
                loop={true}
                playsInline={true}
                poster="https://pqywp9kq4f.ufs.sh/f/09DZgRiD9kI3JipywOeNB1EkSi78mbNtZRyDndqguxe2GFAa"
            >
                <source src="https://pqywp9kq4f.ufs.sh/f/09DZgRiD9kI3A7t2ec6U3sme0DgS4hdPxVFqYyQ2vLwukplc" type="video/mp4" />
                Your browser does not support HTML5 video tags.
            </video>
        </div>
    )
}

// Join Contest component for non-authenticated users
function JoinContest() {
    // Array of random Unsplash avatar URLs using their avatar collection
    const avatarUrls = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces"
    ];

    return (
        <div className="w-full max-w-md mx-auto py-6 px-4">
            <div className="flex justify-center mb-6">
                <div className="flex items-center">
                    {avatarUrls.map((url, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-12 w-12 rounded-full overflow-hidden flex items-center justify-center -ml-3 first:ml-0",
                                "ring-2 ring-background transform hover:scale-110 transition-transform duration-200",
                                "hover:z-10 relative"
                            )}
                            style={{ zIndex: 4 - i }}
                        >
                            <img
                                src={url}
                                alt={`Contestant ${i + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 justify-center">
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="font-medium"
                >
                    <Link href="/auth/signin" className="flex items-center gap-1.5">
                        <LogIn className="h-4 w-4" />
                        <span>Sign In</span>
                    </Link>
                </Button>

                <Button
                    asChild
                    size="sm"
                    className="font-medium"
                >
                    <Link href="/auth/register" className="flex items-center gap-1.5">
                        <UserPlus className="h-4 w-4" />
                        <span>Join</span>
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export default function HomeClient() {
    const { data: session, status } = useSession()
    const isAuthenticated = !!session?.user

    return (
        <main className="flex flex-col items-center justify-center bg-background min-h-[calc(100vh-150px)]">


            {isAuthenticated ? (
                <Suspense fallback={<TypingTestSkeleton />}>
                    <TypingTest quotes={quotes} />
                </Suspense>
            ) : (

                <div className="w-full container flex flex-col items-center gap-8">
                    <div className="flex flex-col items-center gap-4 text-center max-w-2xl mx-auto mt-16 mb-8">
                        <h1 className={`text-5xl font-bold tracking-tighter text-primary ${calistoga.className}`}>
                            Halfaya Typing Contest
                        </h1>
                        <p className="text-md text-muted-foreground leading-relaxed max-w-xl font-light">
                            Exclusive typing competition for PetroChina Halfaya employees. Test your typing speed and accuracy against your colleagues.
                        </p>
                    </div>


                    <Video />

                    <JoinContest />
                </div>

            )}

        </main>
    )
}

