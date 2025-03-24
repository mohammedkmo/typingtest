import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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