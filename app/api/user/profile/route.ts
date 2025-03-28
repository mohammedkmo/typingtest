import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(req: Request) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "You must be signed in to update your profile" },
        { status: 401 }
      )
    }
    
    // Get the data from the request
    const { name, department } = await req.json()
    
    // Basic validation
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }
    
    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        name,
        department 
      },
    })
    
    // Return success
    return NextResponse.json(
      { message: "Profile updated successfully", user: updatedUser },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
} 