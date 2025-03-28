import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Add debug logging
console.log("NextAuth API route initialized");

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 