import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Verification code must be 6 digits" },
        { status: 400 }
      );
    }

    // Find the verification token by email and code
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        code: code,
        expires: {
          gt: new Date()
        }
      }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: {
        token: verificationToken.token
      }
    });

    // Generate a session token
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error("NEXTAUTH_SECRET is not defined");
    }

    const token = await encode({
      token: {
        sub: user.id,
        email: user.email,
      },
      secret,
    });

    // Return the token and user info
    return NextResponse.json({
      success: true,
      token
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
} 