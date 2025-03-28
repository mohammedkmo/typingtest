import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { createTransport } from "nodemailer"
import { Theme } from "next-auth"

const DOMAIN = "@petrochina-hfy.com";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      department?: string | null
    }
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

// Custom function to handle verification requests
async function sendVerificationRequest(params: {
  identifier: string
  url: string
  provider: { server: any; from: string }
  theme: Theme
}) {
  const { identifier: email, url, provider } = params;
  const { server, from } = provider;
  
  // Log the verification URL to help debug
  console.log("Verification URL:", url);
  
  // Create nodemailer transport
  const transport = createTransport(server);
  
  // Customize the email content
  const result = await transport.sendMail({
    to: email,
    from,
    subject: `Sign in to Halfaya Typing Contest`,
    text: `Sign in to Halfaya Typing Contest\n\nClick this link to sign in: ${url}\n\nThe link will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://download.logo.wine/logo/PetroChina/PetroChina-Logo.wine.png" alt="PetroChina Halfaya" style="max-width: 80px;">
        </div>
        <h1 style="color: #333; text-align: center; font-size: 24px; margin-bottom: 20px;">Welcome to Halfaya Typing Contest</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #555; margin-bottom: 25px; text-align: center;">
          Click the button below to sign in to your account. This magic link will expire in 10 minutes.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #4F46E5; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block; transition: background-color 0.3s ease;">Sign In</a>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">
          If the button doesn't work, you can also copy and paste this link into your browser:
        </p>
        <div style="background-color: #f5f5f5; border-radius: 4px; padding: 12px; margin: 15px 0; word-break: break-all; text-align: center;">
          <a href="${url}" style="color: #4F46E5; font-size: 14px; text-decoration: none;">${url}</a>
        </div>
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; color: #888; font-size: 12px;">
          <p>PetroChina Halfaya</p>
          <p>If you didn't request this email, please ignore it.</p>
        </div>
      </div>
    `,
  });
  
  console.log('Email sent successfully:', { messageId: result.messageId, email });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
      maxAge: 24 * 60 * 60, // 24 hours
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    newUser: "/auth/new-user",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("Sign-in callback:", { user, account, email });
      return true;
    },
    async session({ session, token, trigger }) {
      if (token.sub && session.user) {
        session.user.id = token.sub,
        session.user.image = token.picture as string,
        session.user.name = token.name as string,
        session.user.email = token.email as string
      }

      if (trigger === "update") {
        session.user.name = token.name;
        session.user.image = token.picture;
      }

      return session
    },

    async jwt({ token, user, account, profile, session, trigger }) {
      // Add properties to the JWT token
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      if (trigger === "update") {
        token.name = session.user.name;
        token.picture = session.user.image;
      }
      
      return token;
    }
  },
} 