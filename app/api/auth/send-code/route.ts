import { NextRequest, NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { email, isRegistration } = await req.json()
    console.log("Request to send verification code:", { email, isRegistration })

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    })

    // For sign-in, verify the user exists
    if (!isRegistration && !user) {
      console.log("Sign-in attempt for non-existent user:", email)
      return NextResponse.json(
        { error: "Account not found. Please register first." },
        { status: 404 }
      )
    }

    // Send verification code
    await sendVerificationEmail(email)

    return NextResponse.json({
      success: true,
      message: "Verification code sent",
      isNewUser: !user,
    })
  } catch (error) {
    console.error("Error sending verification code:", error)
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    )
  }
} 