"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import { Roboto_Mono } from 'next/font/google'
import { KeyboardIcon, RefreshCcw } from 'lucide-react'

const font = Roboto_Mono({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-roboto-mono',
})

interface TypingTestProps {
  quotes: string[]
}

export default function TypingTest({ quotes }: TypingTestProps) {
  const { data: session } = useSession()
  const [currentQuote, setCurrentQuote] = useState("")
  const [userInput, setUserInput] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState<number | null>(null)
  const [liveWpm, setLiveWpm] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedResult, setSavedResult] = useState(false)
  const [currentQuoteId, setCurrentQuoteId] = useState(0)
  const [remainingTime, setRemainingTime] = useState(30)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { theme, setTheme } = useTheme()
  const [cursorStyle, setCursorStyle] = useState({
    left: 0,
    top: 0,
    height: 0,
  })

  // Add a ref for tracking if the component is mounted
  const isMountedRef = useRef(false)

  // Handle mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true)
    isMountedRef.current = true

    // Check if the device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      isMountedRef.current = false
    }
  }, [])

  // Update cursor position
  useEffect(() => {
    if (textContainerRef.current) {
      const textContainer = textContainerRef.current
      const chars = textContainer.querySelectorAll("span[data-char]")

      if (chars.length > 0 && currentPosition < chars.length) {
        const currentChar = chars[currentPosition]
        const rect = currentChar.getBoundingClientRect()
        const containerRect = textContainer.getBoundingClientRect()

        setCursorStyle({
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
          height: rect.height,
        })
      }
    }
  }, [currentPosition, currentQuote, userInput])

  // Get a random quote
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setCurrentQuoteId(randomIndex)
    return quotes[randomIndex]
  }

  // Initialize game
  const initGame = () => {
    setCurrentQuote(getRandomQuote())
    setUserInput("")
    setStartTime(null)
    setEndTime(null)
    setWpm(null)
    setLiveWpm(null)
    setAccuracy(null)
    setIsFinished(false)
    setIsStarted(false)
    setCurrentPosition(0)
    setCursorStyle({ left: 0, top: 0, height: 0 })
    setSavedResult(false)
    setRemainingTime(30)

    // Clear any existing intervals
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current)
      wpmIntervalRef.current = null
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }

  // Start the game
  useEffect(() => {
    initGame()
    return () => {
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current)
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [])

  // Focus the container when loaded
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus()
    }
  }, [isFinished])

  // Calculate WPM more accurately
  const calculateWPM = () => {
    if (!startTime || !isStarted) return 0

    const timeInSeconds = (Date.now() - startTime) / 1000
    const timeInMinutes = timeInSeconds / 60
    
    // Count actual words
    const words = userInput.trim().split(/\s+/)
    const wordCount = words.length
    
    // If the user is in the middle of typing a word, count characters of partial word
    const partialWord = userInput.trim().endsWith(' ') ? 0 : 
      (userInput.trim().split(/\s+/).pop()?.length || 0) / 5

    // Adjust word count for partially typed word
    const adjustedWordCount = wordCount - (partialWord > 0 ? 1 : 0) + partialWord
    
    if (timeInMinutes === 0) return 0
    return Math.round(adjustedWordCount / timeInMinutes)
  }

  // Update WPM in real-time
  useEffect(() => {
    if (isStarted && !isFinished) {
      // Clear any existing interval
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current)
      }

      // Update WPM every second
      wpmIntervalRef.current = setInterval(() => {
        setLiveWpm(calculateWPM())
      }, 1000)

      // Calculate initial WPM
      setLiveWpm(calculateWPM())
    }

    return () => {
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current)
      }
    }
  }, [isStarted, isFinished, userInput])

  // Timer countdown
  useEffect(() => {
    if (isStarted && !isFinished && remainingTime > 0) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            // Time's up, finish the test
            finishTest()
            clearInterval(timerIntervalRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isStarted, isFinished, remainingTime])

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ignore modifier keys and special keys
    if (
      e.ctrlKey ||
      e.altKey ||
      e.metaKey ||
      e.key === "Shift" ||
      e.key === "Control" ||
      e.key === "Alt" ||
      e.key === "Meta" ||
      e.key === "Tab" ||
      e.key === "CapsLock"
    ) {
      return
    }

    // Handle Escape key for focus mode or reset
    if (e.key === "Escape") {
      e.preventDefault();
      if (isFocusMode) {
        setIsFocusMode(false);
      } else if (isStarted) {
        // Reset the test if already started but not in focus mode
        resetGame();
      }
      return;
    }

    // Prevent default behavior for most keys
    if (e.key !== "Backspace") {
      e.preventDefault()
    }

    // Start timer on first keystroke
    if (!isStarted && !startTime) {
      setStartTime(Date.now())
      setIsStarted(true)
      setIsFocusMode(true) // Enter focus mode when typing starts
    }

    // Handle backspace
    if (e.key === "Backspace" && currentPosition > 0) {
      e.preventDefault()
      setCurrentPosition(currentPosition - 1)
      setUserInput(userInput.slice(0, -1))
      
      // Recalculate accuracy after backspace
      const newUserInput = userInput.slice(0, -1)
      updateAccuracy(newUserInput)
      return
    }

    // Ignore if we're at the end of the quote
    if (currentPosition >= currentQuote.length) {
      return
    }

    // Handle character input
    if (e.key.length === 1) {
      const newUserInput = userInput + e.key
      setUserInput(newUserInput)
      setCurrentPosition(currentPosition + 1)

      // Update accuracy
      updateAccuracy(newUserInput)

      // Check if quote is completed
      if (currentPosition + 1 >= currentQuote.length) {
        finishTest()
      }
    }
  }

  // Extract accuracy calculation to its own function
  const updateAccuracy = (input: string) => {
    let correctChars = 0
    const comparisonLength = Math.min(input.length, currentQuote.length)
    
    for (let i = 0; i < comparisonLength; i++) {
      if (input[i] === currentQuote[i]) {
        correctChars++
      }
    }
    
    const accuracyPercent = input.length > 0 
      ? parseFloat(((correctChars / input.length) * 100).toFixed(2)) 
      : 100
      
    setAccuracy(accuracyPercent)
  }
  
  // Extract test completion logic to its own function
  const finishTest = () => {
    if (!startTime) return
    
    const endTimeStamp = Date.now()
    setEndTime(endTimeStamp)
    
    // Clear timer if active
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    
    // Calculate elapsed time in minutes (max 30 seconds)
    const elapsedTimeInSeconds = (endTimeStamp - startTime) / 1000
    const timeInMinutes = Math.min(elapsedTimeInSeconds, 30) / 60
    
    // Calculate WPM using the same logic as the live calculation
    // Count actual words
    const words = userInput.trim().split(/\s+/)
    const wordCount = words.length
    
    // If the user is in the middle of typing a word, count characters of partial word
    const partialWord = userInput.trim().endsWith(' ') ? 0 : 
      (userInput.trim().split(/\s+/).pop()?.length || 0) / 5
    
    // Adjust word count for partially typed word
    const adjustedWordCount = wordCount - (partialWord > 0 ? 1 : 0) + partialWord
    
    const finalWpm = timeInMinutes > 0 ? Math.round(adjustedWordCount / timeInMinutes) : 0
    
    setWpm(finalWpm)
    setIsFinished(true)
    setIsStarted(false)
    
    // Clear intervals
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current)
      wpmIntervalRef.current = null
    }

    // Don't attempt to save here - we'll use a single effect for that
  }

  // Calculate a performance score that balances WPM and accuracy
  const calculatePerformanceScore = () => {
    if (wpm === null || accuracy === null) return 0
    
    // We use a weighted formula that heavily penalizes low accuracy
    // A perfect 100% accuracy returns full WPM value
    // As accuracy drops, the score drops more dramatically
    // Below 80% accuracy, the penalty becomes severe
    
    const accuracyFactor = Math.pow(accuracy / 100, 2) // Square makes low accuracy more punishing
    const rawScore = wpm * accuracyFactor
    
    // Apply minimum threshold - if accuracy is too low, score drops dramatically
    if (accuracy < 80) {
      return Math.round(rawScore * 0.5) // Severe penalty for spam typing
    }
    
    return Math.round(rawScore)
  }

  // Get a performance rating based on the score
  const getPerformanceRating = () => {
    const score = calculatePerformanceScore()
    
    if (score >= 120) return { label: "Master", color: "text-purple-500" }
    if (score >= 100) return { label: "Expert", color: "text-blue-500" }
    if (score >= 80) return { label: "Advanced", color: "text-green-500" }
    if (score >= 60) return { label: "Skilled", color: "text-yellow-500" }
    if (score >= 40) return { label: "Intermediate", color: "text-orange-500" }
    if (score >= 20) return { label: "Beginner", color: "text-red-500" }
    return { label: "Novice", color: "text-neutral-500" }
  }

  // Reset the game
  const resetGame = () => {
    initGame()
  }

  // Functions to calculate cursor and error text colors based on theme
  const getCursorColor = () => {
    // During SSR/before hydration, use a default value
    if (!mounted) return "bg-white"
    
    if (!theme) return "bg-white" // Default if theme is undefined

    switch (theme) {
      case "dark":
        return "bg-white"
      case "light":
        return "bg-black"
      case "blue":
        return "bg-blue-500"
      case "red":
        return "bg-red-500"
      case "yellow":
        return "bg-yellow-500"
      case "green":
        return "bg-green-500"
      case "purple":
        return "bg-purple-500"
      default:
        return "bg-white"
    }
  }

  const getErrorTextColor = () => {
    // During SSR/before hydration, use a default value
    if (!mounted) return "text-red-500"
    
    if (!theme) return "text-red-500" // Default if theme is undefined

    switch (theme) {
      case "dark":
        return "text-red-500"
      case "light":
        return "text-red-500"
      case "blue":
        return "text-blue-500"
      case "red":
        return "text-red-500"
      case "yellow":
        return "text-yellow-500"
      case "green":
        return "text-green-500"
      case "purple":
        return "text-purple-500"
      default:
        return "text-red-500"
    }
  }

  // Modify the existing code that handles game completion
  useEffect(() => {
    if (isStarted && userInput.length === currentQuote.length && startTime !== null) {
      finishTest()
    }
  }, [userInput, currentQuote, isStarted, startTime]);

  // Single point of truth for saving results - only this effect should call saveResult
  useEffect(() => {
    // Only attempt to save once when the test is finished and all required data is available
    if (
      isFinished && 
      !savedResult && 
      !isSaving && 
      session && 
      wpm !== null && 
      accuracy !== null && 
      accuracy >= 50
    ) {
      console.log('Auto-saving result after test completion');
      // Allow state to settle before saving
      const saveTimeout = setTimeout(() => {
        saveResult();
      }, 500);
      
      return () => clearTimeout(saveTimeout);
    }
  }, [isFinished, savedResult, isSaving, session, wpm, accuracy]);

  // Save the result to the database
  const saveResult = async () => {
    if (!session || savedResult || isSaving) {
      console.log('Save aborted - conditions not met:', { 
        hasSession: !!session, 
        alreadySaved: savedResult, 
        isSaving 
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const resultData = {
        wpm: wpm || 0,
        accuracy: accuracy || 0,
        performanceScore: calculatePerformanceScore(),
        quoteId: currentQuoteId,
        quoteText: currentQuote
      };
      
      console.log('Saving result:', resultData);
      
      // Ensure all values are of the correct type
      if (typeof resultData.wpm !== 'number' || 
          typeof resultData.accuracy !== 'number' || 
          typeof resultData.performanceScore !== 'number' || 
          typeof resultData.quoteId !== 'number' || 
          typeof resultData.quoteText !== 'string') {
        console.error('Invalid data types:', resultData);
        setIsSaving(false);
        return;
      }
      
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultData),
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Result saved successfully:', data);
        setSavedResult(true);
      } else {
        console.error('Failed to save result:', data);
      }
    } catch (error) {
      console.error('Error saving result:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Exit focus mode when test is complete
  useEffect(() => {
    if (isFinished) {
      setIsFocusMode(false);
    }
  }, [isFinished]);

  // Add global key handler for escape even when not focused
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isStarted && !isFinished && !isFocusMode) {
        resetGame();
      }
    };
    
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isStarted, isFinished, isFocusMode]);

  // Set up global keyboard listener to catch all keypresses
  useEffect(() => {
    if (!isMobile && !isFinished) {
      const handleGlobalKeyPress = (e: KeyboardEvent) => {
        // Only handle if not clicking in an input field or textarea
        if (
          document.activeElement instanceof HTMLInputElement || 
          document.activeElement instanceof HTMLTextAreaElement
        ) {
          return
        }
        
        // Focus the container if it's not already focused
        if (
          containerRef.current && 
          document.activeElement !== containerRef.current &&
          e.key.length === 1
        ) {
          containerRef.current.focus()
          
          // This prevents the character from being lost when the focus changes
          // Instead we manually process the key
          if (!isStarted && !startTime) {
            e.preventDefault()
            
            // Start timer on first keystroke
            setStartTime(Date.now())
            setIsStarted(true)
            setIsFocusMode(true)
            
            // Manually add the character
            setUserInput(e.key)
            setCurrentPosition(1)
            
            // Update accuracy
            updateAccuracy(e.key)
          }
        }
      }
      
      window.addEventListener('keydown', handleGlobalKeyPress)
      return () => {
        window.removeEventListener('keydown', handleGlobalKeyPress)
      }
    }
  }, [isMobile, isFinished, isStarted, startTime])

  // Always focus the container when the component is loaded or reset
  useEffect(() => {
    if (!isMobile && !isFinished && containerRef.current && isMountedRef.current) {
      containerRef.current.focus()
    }
  }, [isMobile, isFinished, mounted])

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  // Mobile device warning
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full flex flex-col items-center">
          <KeyboardIcon className="h-8 w-8 mb-6 text-foreground opacity-50" strokeWidth={1.5} />
          <h2 className="text-xl font-medium mb-3">Desktop Only</h2>
          <p className="text-muted-foreground text-sm text-center mb-6">
            This typing test requires a physical keyboard for accurate results. 
            Please visit on a desktop device.
          </p>
          <div className="w-full h-px bg-border my-2" />
          <p className="text-xs text-center text-muted-foreground mt-4">
            The typing test measures WPM and accuracy over 30 seconds
          </p>
        </div>
      </div>
    )
  }

  // Results Screen
  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <div className="absolute top-4 right-4 text-xs text-muted-foreground flex items-center gap-1.5">
          <span>Results mode</span>
          <Button
            onClick={resetGame}
            variant="outline"
            size="sm"
            className="text-xs ml-2"
          >
            New Test
          </Button>
        </div>
        
        <div className="w-full max-w-3xl px-4 py-6 overflow-y-auto max-h-screen">
          <div className="flex flex-col sm:flex-row gap-8 mb-8 justify-between">
            {/* Left Column - Performance Score */}
            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="text-sm uppercase tracking-wider text-muted-foreground">Performance Score</div>
              <div
                className={cn(
                  "text-6xl font-bold",
                  !mounted 
                    ? "text-neutral-600"
                    : theme === "dark"
                      ? "text-neutral-400"
                      : theme === "light"
                        ? "text-neutral-800"
                        : theme === "blue"
                          ? "text-blue-600"
                          : theme === "red"
                            ? "text-red-600"
                            : theme === "yellow"
                              ? "text-yellow-600"
                              : theme === "green"
                                ? "text-green-600"
                                : theme === "purple"
                                  ? "text-purple-600"
                                  : "text-neutral-600",
                )}
              >
                {calculatePerformanceScore()}
              </div>
              <div className={cn("text-lg font-medium", getPerformanceRating().color)}>
                {getPerformanceRating().label}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                30-second timed test
              </div>
            </div>

            {/* Right Column - WPM and Accuracy */}
            <div className="flex gap-8 justify-center sm:justify-end">
              <div className="flex flex-col items-center sm:items-end gap-1">
                <div className="text-muted-foreground text-sm uppercase tracking-wider">wpm</div>
                <div
                  className={cn(
                    "text-5xl font-normal",
                    !mounted 
                      ? "text-neutral-600"
                      : theme === "dark"
                        ? "text-neutral-500"
                        : theme === "light"
                          ? "text-neutral-600"
                          : theme === "blue"
                            ? "text-blue-700"
                            : theme === "red"
                              ? "text-red-700"
                              : theme === "yellow"
                                ? "text-yellow-700"
                                : theme === "green"
                                  ? "text-green-700"
                                  : theme === "purple"
                                    ? "text-purple-700"
                                    : "text-neutral-600",
                  )}
                >
                  {wpm}
                </div>
              </div>
              <div className="flex flex-col items-center sm:items-end gap-1">
                <div className="text-muted-foreground text-sm uppercase tracking-wider">acc</div>
                <div
                  className={cn(
                    "text-5xl font-normal",
                    !mounted 
                      ? "text-neutral-600"
                      : theme === "dark"
                        ? "text-neutral-500"
                        : theme === "light"
                          ? "text-neutral-600"
                          : theme === "blue"
                            ? "text-blue-700"
                            : theme === "red"
                              ? "text-red-700"
                              : theme === "yellow"
                                ? "text-yellow-700"
                                : theme === "green"
                                  ? "text-green-700"
                                  : theme === "purple"
                                    ? "text-purple-700"
                                    : "text-neutral-600",
                  )}
                >
                  {accuracy !== null ? accuracy.toFixed(2) : "100"}%
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results Card */}
          <div className="bg-card/60 border border-border rounded-lg shadow-sm backdrop-blur-sm">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-lg font-medium">Your Results</h3>
              
              {session && savedResult && (
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  <span>Result saved</span>
                </div>
              )}
              
              {session && !savedResult && accuracy !== null && accuracy < 50 && (
                <div className="text-xs text-muted-foreground">
                  Result not saved (accuracy below 50%)
                </div>
              )}
              
              {!session && (
                <span className="text-xs text-muted-foreground">Sign in to save your results</span>
              )}
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Performance Score Card */}
              <div className="md:col-span-3 p-4 bg-background/60 rounded-md border border-border flex flex-col items-center backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold">{calculatePerformanceScore()}</div>
                  <div className={cn("text-base font-medium", getPerformanceRating().color)}>
                    {getPerformanceRating().label}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 text-center max-w-md">
                  Performance score combines WPM and accuracy. High WPM with low accuracy is heavily penalized.
                  Score based on words typed in 30 seconds.
                </div>
              </div>
              
              {/* Metrics Cards */}
              <div className="p-3 bg-background/60 rounded-md border border-border backdrop-blur-sm">
                <div className="text-2xl font-bold">{wpm}</div>
                <div className="text-sm text-muted-foreground">Words per minute</div>
              </div>
              
              <div className="p-3 bg-background/60 rounded-md border border-border backdrop-blur-sm">
                <div className="text-2xl font-bold">{accuracy !== null ? accuracy.toFixed(2) : "100"}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              
              <div className="p-3 bg-background/60 rounded-md border border-border backdrop-blur-sm">
                <div className="text-2xl font-bold">{endTime && startTime ? ((endTime - startTime) / 1000).toFixed(1) : "0"}s</div>
                <div className="text-sm text-muted-foreground">Time taken</div>
              </div>
              
              {/* Additional Stats */}
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-background/60 rounded-md border border-border backdrop-blur-sm">
                  <div className="text-lg font-medium">{currentQuote.length}</div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </div>
                
                <div className="p-3 bg-background/60 rounded-md border border-border backdrop-blur-sm">
                  <div className="text-lg font-medium">{currentQuote.trim().split(/\s+/).length}</div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
                
                <div className="p-3 bg-background/60 rounded-md border border-border backdrop-blur-sm">
                  <div className="text-lg font-medium">
                    {accuracy !== null && accuracy === 100 
                      ? "Perfect" 
                      : accuracy !== null && accuracy > 95 
                        ? "Excellent" 
                        : accuracy !== null && accuracy > 90 
                          ? "Great" 
                          : accuracy !== null && accuracy > 80
                            ? "Good"
                            : "Practice more"}
                  </div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
                
                <div className="p-3 bg-background/60 rounded-md border border-border backdrop-blur-sm">
                  <div className="text-lg font-medium">
                    {calculatePerformanceScore() > 100 ? "Expert" : 
                     calculatePerformanceScore() > 80 ? "Advanced" : 
                     calculatePerformanceScore() > 60 ? "Skilled" : 
                     calculatePerformanceScore() > 40 ? "Intermediate" : "Beginner"}
                  </div>
                  <div className="text-sm text-muted-foreground">Skill Level</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border flex justify-between items-center">
              <Button 
                onClick={resetGame} 
                size="lg"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      `w-full flex flex-col items-center gap-3 transition-all duration-300 ease-in-out ${font.className}`,
      isFocusMode 
        ? "fixed inset-0 z-50 bg-background/90 backdrop-blur-md py-0 px-0 justify-center"
        : "py-8 px-4"
    )}>
      {isFocusMode && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-sm text-muted-foreground/80 flex items-center gap-2">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-accent text-xs">ESC</kbd>
          <span>to exit</span>
        </div>
      )}

      {isStarted && !isFocusMode && (
        <div className="absolute top-4 right-4 text-xs text-muted-foreground flex items-center gap-1.5">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px]">ESC</kbd>
          <span>to reset</span>
        </div>
      )}

      {/* Timer display */}
      <div className={cn(
        "flex items-center gap-2 transition-all duration-200",
        remainingTime <= 5 
          ? "text-red-500"
          : remainingTime <= 10 
            ? "text-yellow-500" 
            : "text-foreground",
        isFocusMode && "mt-12"
      )}>
        <div className="text-xl font-bold tabular-nums">
          {remainingTime}
        </div>
        <div className="text-sm text-muted-foreground">
          {remainingTime <= 5 ? "Time running out" : "seconds"}
        </div>
      </div>

      {/* Interactive quote display - no background, no borders */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full max-h-80 overflow-y-auto focus:outline-none focus:ring-0", 
          isFocusMode ? "max-w-2xl" : "max-w-3xl"
        )}
      >
        <div ref={textContainerRef} className={cn(
          "relative leading-relaxed",
          isFocusMode ? "text-xl md:text-2xl" : "text-lg md:text-xl"
        )}>
          {/* Cursor */}
          <span
            className={cn("absolute w-0.5 will-change-transform", getCursorColor(), isStarted ? "" : "animate-cursor")}
            style={{
              left: `${cursorStyle.left}px`,
              top: `${cursorStyle.top}px`,
              height: `${cursorStyle.height}px`,
              transition: "all 30ms cubic-bezier(0.25, 0.1, 0.25, 1.0)",
            }}
          />

          {/* Text */}
          {currentQuote.split("").map((char, index) => {
            let style = "opacity-40" // Default untyped style

            if (index < userInput.length) {
              // Typed characters
              if (userInput[index] === char) {
                style = "opacity-100" // Correct
              } else {
                style = cn(getErrorTextColor(), "opacity-100") // Incorrect
              }
            }

            return (
              <span key={index} data-char={index} className={style}>
                {char}
              </span>
            )
          })}
        </div>
      </div>

      {/* Live WPM counter */}
      <div
        className={cn(
          "text-sm mt-4 flex items-center gap-1.5 h-5",
          !mounted 
            ? "text-neutral-600"
            : theme === "dark"
              ? "text-neutral-500"
              : theme === "light"
                ? "text-neutral-600"
                : theme === "blue"
                  ? "text-blue-600"
                  : theme === "red"
                    ? "text-red-600"
                    : theme === "yellow"
                      ? "text-yellow-600"
                      : theme === "green"
                        ? "text-green-600"
                        : theme === "purple"
                          ? "text-purple-600"
                          : "text-neutral-600",
        )}
      >
        {isStarted && !isFinished && (
          <>
            <span className="font-medium">{liveWpm}</span>
            <span className="uppercase text-xs tracking-wider">wpm</span>
          </>
        )}
      </div>

      {/* Controls section */}
      <div className="flex items-center gap-4 mt-2">
        {/* Reset button - minimal style, hide in focus mode unless typing has started */}
        {(!isFocusMode || (isFocusMode && isStarted)) && (
          <Button
            onClick={resetGame}
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs uppercase tracking-wider flex items-center gap-1",
              !mounted 
                ? "text-neutral-600"
                : theme === "dark"
                  ? "text-neutral-500"
                  : theme === "light"
                    ? "text-neutral-600"
                    : theme === "blue"
                      ? "text-blue-600"
                      : theme === "red"
                        ? "text-red-600"
                        : theme === "yellow"
                          ? "text-yellow-600"
                          : theme === "green"
                            ? "text-green-600"
                            : theme === "purple"
                              ? "text-purple-600"
                              : "text-neutral-600",
            )}
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {!isStarted && !isFinished && (
        <div className="text-sm text-muted-foreground mb-2">
          Just start typing to begin the test
        </div>
      )}
    </div>
  )
}



