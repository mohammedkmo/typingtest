"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, Trophy, Medal, Crown, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Calistoga } from "next/font/google"
import { Skeleton } from "@/components/ui/skeleton"

const calistoga = Calistoga({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
})

interface TypingResult {
  id: string
  wpm: number
  accuracy: number
  performanceScore: number
  quoteText: string
  createdAt: string
  user: {
    name: string | null
    email: string | null
    image: string | null
    department: string | null
  }
}

// Helper function to get performance rating
const getPerformanceRating = (score: number | undefined | null) => {
  if (score === undefined || score === null) return { label: "Unrated", color: "text-neutral-400" }
  
  if (score >= 120) return { label: "Master", color: "text-purple-500" }
  if (score >= 100) return { label: "Expert", color: "text-blue-500" }
  if (score >= 80) return { label: "Advanced", color: "text-green-500" }
  if (score >= 60) return { label: "Skilled", color: "text-yellow-500" }
  if (score >= 40) return { label: "Intermediate", color: "text-orange-500" }
  if (score >= 20) return { label: "Beginner", color: "text-red-500" }
  return { label: "Novice", color: "text-neutral-500" }
}

// Skeleton component for leaderboard results
function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="rounded-md border border-border p-4 flex items-center space-x-4">
          <Skeleton className={`h-8 w-8 rounded-full ${i < 3 ? 'bg-primary/20' : 'bg-muted'}`} />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LeaderboardClient() {
  const { data: session } = useSession()
  const [results, setResults] = useState<TypingResult[]>([])
  const [topPerformer, setTopPerformer] = useState<TypingResult | null>(null)
  const [isTopPerformerLoading, setIsTopPerformerLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"global" | "personal">("global")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  
  // Calculate max score for progress bars
  const maxScore = Math.max(120, ...results.map(r => r.performanceScore || 0))
  
  // Fetch the top performer separately
  useEffect(() => {
    async function fetchTopPerformer() {
      if (view !== "global") return;
      
      setIsTopPerformerLoading(true);
      try {
        const response = await fetch('/api/results?topPerformer=true', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          console.error("Failed to fetch top performer");
          return;
        }
        
        const data = await response.json();
        
        if (data && data.topPerformer) {
          setTopPerformer(data.topPerformer);
        }
      } catch (error) {
        console.error("Error fetching top performer:", error);
      } finally {
        setIsTopPerformerLoading(false);
      }
    }
    
    fetchTopPerformer();
  }, [view]);
  
  useEffect(() => {
    async function fetchResults() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Always sort by performance score for contest format
        const url = view === "personal" && session?.user.id 
          ? `/api/results?userId=${session.user.id}&page=${currentPage}&itemsPerPage=${pagination.itemsPerPage}` 
          : `/api/results?page=${currentPage}&itemsPerPage=${pagination.itemsPerPage}`
          
        console.log("Fetching from URL:", url)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("API response error:", response.status, errorData)
          throw new Error(`API error: ${errorData.error || 'Failed to load data'}`)
        }
        
        const data = await response.json()
        
        if (!data || !Array.isArray(data.results)) {
          console.error("Invalid data format:", data)
          throw new Error("Invalid data format received")
        }
        
        setResults(data.results)
        
        // Update pagination data if available
        if (data.pagination) {
          setPagination(data.pagination)
        }
      } catch (error: any) {
        console.error("Error fetching leaderboard data:", error)
        setError(error?.message || "Failed to load leaderboard data")
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session !== undefined || view === "global") {
      fetchResults()
    }
  }, [view, session, currentPage, pagination.itemsPerPage])
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setCurrentPage(newPage)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  // Reset to first page when view changes
  useEffect(() => {
    setCurrentPage(1)
  }, [view])
  
  // Pagination controls component
  const PaginationControls = () => {
    if (pagination.totalPages <= 1) return null
    
    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button 
          variant="outline" 
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {[...Array(pagination.totalPages)].map((_, i) => {
            const pageNumber = i + 1
            
            // Show current page, first, last, and pages around current
            if (
              pageNumber === 1 || 
              pageNumber === pagination.totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <Button
                  key={i}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            }
            
            // Show ellipsis for breaks in sequence
            if (
              (pageNumber === 2 && currentPage > 3) ||
              (pageNumber === pagination.totalPages - 1 && currentPage < pagination.totalPages - 2)
            ) {
              return <span key={i} className="px-1">...</span>
            }
            
            return null
          })}
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          disabled={currentPage >= pagination.totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    )
  }
  
  return (
    <main className="bg-background py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${calistoga.className}`}>
              Typing Contest Leaderboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Where speed meets accuracy in perfect harmony
            </p>
          </div>
          <Button variant="outline" asChild size="sm" className="mt-2 md:mt-0">
            <Link href="/" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Typing Test
            </Link>
          </Button>
        </div>
        
        <div className="flex gap-2 mb-6">
          <Button
            variant={view === "global" ? "default" : "ghost"}
            onClick={() => setView("global")}
            size="sm"
            className="min-w-[100px] font-medium"
          >
            Global Rankings
          </Button>
          {session && (
            <Button
              variant={view === "personal" ? "default" : "ghost"}
              onClick={() => setView("personal")}
              size="sm"
              className="min-w-[100px] font-medium"
            >
              My Results
            </Button>
          )}
        </div>
        
        {/* Contest banner */}
        {view === "global" && (
          <div className="mb-8 border border-border bg-background text-primary rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="p-6 md:col-span-2 gap-4 flex flex-col justify-center">
  
          
                   <div className="flex items-center gap-2">
                    <Image src="/logo.png" alt="typetest" width={30} height={30} />
                    <h1 className={`text-accent-foreground font-bold text-lg ${calistoga.className}`}>Halfaya Typing Contest</h1>
                   </div>
              
              
                
                <p className="text-sm text-zinc-400 mb-4 max-w-md">
                  Test your speed and accuracy against others. Performance scores combine both metrics for the most accurate ranking.
                </p>
                
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-2xl font-bold tabular-nums">{pagination.totalItems || results.length}</div>
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Participants</div>
                  </div>
                  <div className="h-8 border-l border-border"></div>
                  <div>
                    <div className="text-2xl font-bold tabular-nums">
                      {isTopPerformerLoading ? (
                        <Skeleton className="h-8 w-16 inline-block" />
                      ) : (
                        topPerformer ? topPerformer.performanceScore : 0
                      )}
                    </div>
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Top Score</div>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex bg-white border-l border-border relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[130px] blur-3xl font-black tracking-tighter text-primary/10 rotate-12 select-none leading-none">
                    <Image src="/logo.png" alt="Logo" width={300} height={300} className="opacity-65" />
                  </div>
                </div>

                {isTopPerformerLoading ? (
                  <div className="absolute top-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </div>
                ) : topPerformer ? (
                  <div className="absolute top-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white/50">
                        <Image 
                          src={topPerformer.user.image || "/default-avatar.jpg"} 
                          alt="Leader" 
                          width={48} 
                          height={48}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black">{topPerformer.user.name || 'Anonymous'}</div>
                        <div className="text-xs text-black/50">Current Leader . {topPerformer.user.department || 'Unknown Department'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-0 left-0 right-0 p-5">
                    <div className="text-sm text-black/70">No performers yet</div>
                  </div>
                )}
                
                <div className="absolute bottom-0 right-0 p-5 text-accent">
                  <div className="text-xs text-black/50">Updated</div>
                  <div className="text-sm text-black">
                    {new Date().toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Results section */}
        {isLoading ? (
          <div className="py-4">
            <LeaderboardSkeleton />
          </div>
        ) : error ? (
          <div className="rounded-lg overflow-hidden border border-red-200 dark:border-red-800">
            <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 p-4 text-sm">
              <p className="font-medium">Failed to load leaderboard</p>
              <p className="mt-1 text-red-600 dark:text-red-500">{error}</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/30 flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">
              {view === "personal" 
                ? "Complete your first typing test to see your results here"
                : "No results available yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => {
              const rating = getPerformanceRating(result.performanceScore);
              const scorePercent = result.performanceScore != null 
                ? Math.min(100, (result.performanceScore / maxScore) * 100) 
                : 0;
              
              return (
                <motion.div 
                  key={result.id}
                  className={`rounded-md ${
                    index < 3 && currentPage === 1
                      ? index === 0 
                        ? 'border-l-[3px] border-amber-300 border-y border-r border-border' 
                        : index === 1 
                          ? 'border-l-[3px] border-blue-300 border-y border-r border-border' 
                          : 'border-l-[3px] border-emerald-300 border-y border-r border-border'  
                      : 'border border-border'
                  } bg-background hover:bg-card/30 transition-all duration-200`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <div className="p-4 md:p-5">
                    <div className="flex items-center gap-5">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold flex-shrink-0 ${
                        index === 0 && currentPage === 1 ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-amber-600 dark:text-amber-400' :
                        index === 1 && currentPage === 1 ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-400' :
                        index === 2 && currentPage === 1 ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400' :
                        'bg-muted/20 border-border/50 border text-muted-foreground/80'
                      }`}>
                        {index === 0 && currentPage === 1 ? <Crown className="h-4 w-4" /> : 
                         index === 1 && currentPage === 1 ? <Medal className="h-4 w-4" /> : 
                         index === 2 && currentPage === 1 ? <Trophy className="h-4 w-4" /> : 
                         <span className="text-xs">{((currentPage - 1) * pagination.itemsPerPage) + index + 1}</span>}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">
                          {result.user.name || result.user.email || "Anonymous"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(result.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })
                          
                          + " . " + result.user.department || 'Unknown Department'
                          
                          }
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 md:gap-8">
                        <div>
                          <div className="text-lg font-medium tabular-nums text-right">
                            {result.wpm}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground text-right">
                            wpm
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-lg font-medium tabular-nums text-right">
                            {result.accuracy !== undefined && result.accuracy !== null 
                              ? result.accuracy.toFixed(1) 
                              : "0.0"}%
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground text-right">
                            accuracy
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="text-lg font-medium tabular-nums">
                            {result.performanceScore !== undefined && result.performanceScore !== null
                              ? result.performanceScore
                              : "N/A"}
                          </div>
                          <div className={`text-[10px] uppercase tracking-wider ${
                            index === 0 && currentPage === 1
                              ? 'text-amber-600 dark:text-amber-400' 
                              : index === 1 && currentPage === 1
                                ? 'text-blue-600 dark:text-blue-400' 
                                : index === 2 && currentPage === 1
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-muted-foreground'
                          }`}>
                            {rating.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Add pagination controls after the results list */}
        {!isLoading && !error && results.length > 0 && (
          <PaginationControls />
        )}
        
        {/* Display pagination info */}
        {!isLoading && !error && results.length > 0 && pagination.totalItems > 0 && (
          <div className="text-center text-xs text-muted-foreground mt-4">
            Showing {results.length} of {pagination.totalItems} results
          </div>
        )}
      </div>
    </main>
  )
}