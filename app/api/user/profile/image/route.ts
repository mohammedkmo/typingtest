import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "You must be signed in to update your profile image" },
        { status: 401 }
      )
    }
    
    const body = await req.json()

    
    if (!body.image) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 }
      )
    }

    try {
      // Update the user's profile image URL in the database
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: body.image },
      })
      
      return NextResponse.json(
        { 
          message: "Profile image URL updated successfully",
          imageUrl: body.image
        },
        { status: 200 }
      )
    } catch (error) {
      console.error("Error updating image URL:", error)
      return NextResponse.json(
        { error: `Error updating image URL: ${error instanceof Error ? error.message : String(error)}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error updating profile image URL:", error)
    return NextResponse.json(
      { error: `Failed to update profile image URL: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
