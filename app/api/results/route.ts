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
    const page = parseInt(url.searchParams.get("page") || "1")
    const itemsPerPage = parseInt(url.searchParams.get("itemsPerPage") || "10")
    
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

    // Calculate pagination values
    const skip = (page - 1) * itemsPerPage;
    let results;
    let totalCount = 0;
    
    if (userId) {
      // Get total count for personal results
      totalCount = await prisma.typingResult.count({
        where: { userId }
      });
      
      // If userId is provided, return paginated results for that user
      results = await prisma.typingResult.findMany({
        where: { userId },
        orderBy,
        skip,
        take: itemsPerPage,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
              department: true,
            },
          },
        },
      })
    } else {
      // For global rankings, use a different approach to count distinct users
      // This avoids issues with raw SQL queries
      const distinctUsers = await prisma.typingResult.findMany({
        select: {
          userId: true
        },
        distinct: ['userId']
      });
      
      totalCount = distinctUsers.length;
      
      // If no userId, return global ranking with best result per user
      results = await prisma.typingResult.findMany({
        where: {},
        orderBy,
        distinct: ['userId'],
        skip,
        take: itemsPerPage,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
              department: true,
            },
          },
        },
      })
    }
    
    // Return results with pagination metadata
    return NextResponse.json({
      results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / itemsPerPage),
        totalItems: totalCount,
        itemsPerPage
      }
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching results:", error instanceof Error ? error.message : String(error))
    console.error("Error details:", error)
    
    return NextResponse.json(
      { 
        error: "Failed to fetch results", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 