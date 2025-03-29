import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createTransport } from "nodemailer"
import { Theme } from "next-auth"
import crypto from 'crypto'

const DOMAIN = "@petrochina-hfy.com";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      department?: string | null,
    }
  }
  
  interface User {
    department?: string | null
  }
}

// Extend JWT to include id
declare module "next-auth/jwt" {
  interface JWT {
    id?: string
  }
}

// Helper function to normalize email addresses
function normalizeEmail(email: string): string {
  if (!email) return email;
  
  // Remove any special characters except alphanumeric, dots, underscores, and hyphens
  let sanitizedEmail = email;
  
  // If email has @ symbol
  if (sanitizedEmail.includes('@')) {
    // Get only the part before @
    sanitizedEmail = sanitizedEmail.split('@')[0];
  }
  
  // Remove any remaining special characters
  sanitizedEmail = sanitizedEmail.replace(/[^a-zA-Z0-9._-]/g, '');
  
  // Append our domain
  return `${sanitizedEmail}${DOMAIN}`;
}

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Send email with verification code
export async function sendVerificationEmail(email: string): Promise<string> {
  // Generate a 6-digit code
  const verificationCode = generateVerificationCode();
  
  // Generate a token for this verification
  const token = crypto.randomUUID();
  
  // Store the code with the token in the database
  await prisma.verificationToken.upsert({
    where: { token },
    update: { 
      code: verificationCode,
    },
    create: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      code: verificationCode,
    },
  });
  
  console.log('Verification code generated:', { email, code: verificationCode, token });
  
  // Create nodemailer transport
  const transport = createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: true,
  });
  
  // Send email with the code
  const result = await transport.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: `Your Verification Code for Halfaya Typing Contest`,
    text: `Your verification code is: ${verificationCode}\n\nThe code will expire in 10 minutes.`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #333333;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="460" style="background-color: #ffffff;">
                <!-- Logo -->
                <tr>
                  <td style="text-align: center; padding-bottom: 32px;">
                    <img src="https://www.petrochina.com.cn/ptr/gsbs/201404/b23a63fa43d04bd89decf8a9345b6f97/images/36ad4aecace742139d74727a8f2ee5d0.jpg" alt="PetroChina Halfaya" style="width: 60px; height: auto;">
                  </td>
                </tr>
                
                <!-- Heading -->
                <tr>
                  <td style="padding-bottom: 24px; text-align: center;">
                    <h1 style="font-size: 24px; font-weight: 500; color: #1a1a1a; margin: 0;">Your verification code</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding-bottom: 32px; text-align: center;">
                    <p style="font-size: 16px; line-height: 24px; color: #525252; margin: 0 0 24px 0;">
                      Enter this verification code in the Halfaya Typing Contest app:
                    </p>
                    
                    <!-- Code block -->
                    <div style="margin: 24px 0; border: 1px solid #e6e6e6; border-radius: 4px; padding: 16px;">
                      <div style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: normal; letter-spacing: 4px; color: #1a1a1a;">
                        ${verificationCode}
                      </div>
                    </div>
                    
                    <p style="font-size: 14px; color: #6e6e6e; margin: 0;">
                      This code will expire in 10 minutes.
                    </p>
                  </td>
                </tr>
                
                <!-- Tips -->
                <tr>
                  <td style="padding: 24px 0; border-top: 1px solid #f2f2f2; font-size: 14px; color: #6e6e6e; line-height: 21px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <strong style="color: #1a1a1a;">Typing Contest Tips</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 4px;">• Focus on accuracy first, then speed</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 4px;">• Take short breaks to prevent fatigue</td>
                      </tr>
                      <tr>
                        <td>• Practice regularly for consistent improvement</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding-top: 32px; border-top: 1px solid #f2f2f2; text-align: center; font-size: 12px; color: #a3a3a3;">
                    <p style="margin: 0 0 12px 0;">
                      If you didn't request this code, please ignore this email.
                    </p>
                    <p style="margin: 0;">
                      © 2024 PetroChina Halfaya
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
  
  console.log('Verification email sent:', { messageId: result.messageId, email });
  
  return verificationCode;
}

// Verify a code for a given email
export async function verifyCode(email: string, code: string): Promise<boolean> {
  // Find the verification token in the database
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
    console.log("Invalid verification code:", { email, code });
    return false;
  }
  
  // Delete the token to prevent reuse
  await prisma.verificationToken.delete({
    where: {
      token: verificationToken.token
    }
  });
  
  console.log("Valid verification code, token deleted:", { email, code });
  return true;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "email-code",
      name: "Email Code",
      credentials: {
        email: { label: "Email", type: "text" },
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          return null;
        }
        
        const email = normalizeEmail(credentials.email);
        const code = credentials.code;
        
        try {
          // Verify the code
          const isValid = await verifyCode(email, code);
          
          if (!isValid) {
            console.log("Code verification failed");
            return null;
          }
          
          // Find or create the user
          let user = await prisma.user.findUnique({
            where: { email },
          });
          
          if (!user) {
            // If user doesn't exist, create a new one
            console.log("User not found, creating new user:", email);
            user = await prisma.user.create({
              data: {
                email,
                name: email.split('@')[0],
                emailVerified: new Date(),
              },
            });
          } else if (!user.emailVerified) {
            // Mark the email as verified if it wasn't already
            await prisma.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() },
            });
          }
          
          console.log("User authenticated:", user);
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    newUser: "/auth/new-user",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub,
        session.user.image = token.picture as string,
        session.user.name = token.name as string,
        session.user.email = token.email as string
      }
      
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      
      return token;
    },
  },
} 