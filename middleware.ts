import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

// Protect all routes under /app
export const config = {
  matcher: ["/settings/:path*"]
}
