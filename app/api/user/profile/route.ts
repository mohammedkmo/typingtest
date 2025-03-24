import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Define the validation schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

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
    const body = await req.json()
    
    // Validate data
    const validationResult = profileSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { name } = validationResult.data
    
    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name }
    })
    
    // Remove sensitive information from the response
    const { password, ...userWithoutPassword } = updatedUser
    
    return NextResponse.json(
      { 
        message: "Profile updated successfully",
        user: userWithoutPassword 
      },
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