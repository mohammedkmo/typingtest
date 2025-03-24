import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"

const DOMAIN = "@petrochina-hfy.com";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // Normalize email (add domain if needed)
          const normalizedEmail = normalizeEmail(credentials.email);

          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    newUser: "/auth/new-user",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
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