import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function POST(req: Request) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "You must be signed in to save results" },
        { status: 401 }
      )
    }
    
    // Get the data from the request
    const { wpm, accuracy, performanceScore, quoteId, quoteText } = await req.json()
    
    // Validate data
    if (typeof wpm !== "number" || typeof accuracy !== "number" || 
        typeof quoteId !== "number" || typeof quoteText !== "string" ||
        typeof performanceScore !== "number") {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      )
    }
    
    // Save to the database
    const result = await prisma.typingResult.create({
      data: {
        userId: session.user.id,
        wpm,
        accuracy,
        performanceScore,
        quoteId,
        quoteText,
      },
    })
    
    return NextResponse.json({ success: true, result }, { status: 201 })
  } catch (error) {
    console.error("Error saving result:", error)
    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const url = new URL(req.url)
    
    // Get query parameters
    const userId = url.searchParams.get("userId")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    
    // Always default to performanceScore for contest format
    const orderBy: Prisma.TypingResultOrderByWithRelationInput = {
      performanceScore: 'desc' as Prisma.SortOrder
    }
    
    // If userId is provided, verify it's the current user or handle authorization
    if (userId && (!session || session.user.id !== userId)) {
      return NextResponse.json(
        { error: "Unauthorized to access these results" },
        { status: 403 }
      )
    }

    let results;
    
    if (userId) {
      // If userId is provided, return all results for that user
      results = await prisma.typingResult.findMany({
        where: { userId },
        orderBy,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })
    } else {
      // If no userId, return global ranking with best result per user
      results = await prisma.typingResult.findMany({
        where: {},
        orderBy,
        distinct: ['userId'],
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })
    }
    
    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    )
  }
} 