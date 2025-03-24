import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { compare, hash } from "bcrypt"
import { z } from "zod"

// Define the validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

export async function PUT(req: Request) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "You must be signed in to update your password" },
        { status: 401 }
      )
    }
    
    // Get the data from the request
    const body = await req.json()
    
    // Validate data
    const validationResult = passwordSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { currentPassword, newPassword } = validationResult.data
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "User not found or no password set" },
        { status: 404 }
      )
    }
    
    // Verify the current password
    const isPasswordValid = await compare(currentPassword, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }
    
    // Hash the new password
    const hashedPassword = await hash(newPassword, 10)
    
    // Update the password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })
    
    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    )
  }
} 