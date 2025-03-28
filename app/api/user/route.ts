import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Create a new user
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, department } = body
    
    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }
    
    if (!department) {
      return NextResponse.json(
        { error: "Department is required" },
        { status: 400 }
      )
    }
    
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      )
    }
    
    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        department,
      }
    })
    
    return NextResponse.json(
      { message: "User created successfully", userId: newUser.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "You must be signed in to delete your account" },
        { status: 401 }
      )
    }
    
    // Delete all user data (cascade will handle related data)
    await prisma.user.delete({
      where: { id: session.user.id }
    })
    
    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
} 