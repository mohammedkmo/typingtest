import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Geist } from 'next/font/google'
import { Providers } from "./providers"


const font = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: "Typing Test",
  description: "A minimalist typing test application",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}