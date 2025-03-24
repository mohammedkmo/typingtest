import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { existsSync } from "fs"

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
    
    // Parse the form data
    const formData = await req.formData()
    const image = formData.get("image") as File
    
    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }
    
    // Limit file size (5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size should be less than 5MB" },
        { status: 400 }
      )
    }
    
    try {
      // Get file data
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Get the file extension
      const fileExtension = image.name.split(".").pop() || "jpg"
      
      // Create a unique filename
      const fileName = `${uuidv4()}.${fileExtension}`
      const uploadDir = join(process.cwd(), "public", "uploads")
      const publicPath = `/uploads/${fileName}`
      const filePath = join(uploadDir, fileName)
      
      // Ensure the uploads directory exists
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      console.log("Saving file to:", filePath)
      // Save the file
      await writeFile(filePath, buffer)
      console.log("File saved successfully")
      
      // Update the user's profile image in the database
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: publicPath }
      })
      
      return NextResponse.json(
        { 
          message: "Profile image updated successfully",
          imageUrl: publicPath
        },
        { status: 200 }
      )
    } catch (error) {
      console.error("Error saving file:", error)
      return NextResponse.json(
        { error: `Error saving file: ${error instanceof Error ? error.message : String(error)}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error updating profile image:", error)
    return NextResponse.json(
      { error: `Failed to update profile image: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
} 