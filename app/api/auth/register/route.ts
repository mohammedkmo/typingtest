import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcrypt';
import { z } from 'zod';

const DOMAIN = "@petrochina-hfy.com";

// Define the validation schema
const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string()
    .transform(val => {
      // Sanitize the email - remove special characters
      let sanitizedEmail = val;
      
      // If email has @ symbol
      if (sanitizedEmail.includes('@')) {
        // Get only the part before @
        sanitizedEmail = sanitizedEmail.split('@')[0];
      }
      
      // Remove any remaining special characters
      sanitizedEmail = sanitizedEmail.replace(/[^a-zA-Z0-9._-]/g, '');
      
      // Append our domain
      return `${sanitizedEmail}${DOMAIN}`;
    }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input data
    const validationResult = userSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validationResult.data;
    
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Add the password field to the User model
      },
    });
    
    // Omit the password from the response
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: userWithoutPassword 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Error in registration:", error);
    
    // Check for validation error
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
} 