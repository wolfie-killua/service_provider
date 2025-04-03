import type React from "react"
import "./globals.css"
import { Inter, Cinzel } from "next/font/google"
import Header from "@/components/header"

// Define the fonts properly
const inter = Inter({ subsets: ["latin"] })
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
})

export const metadata = {
  title: "Killua Service Provider",
  description: "Church service provider application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${cinzel.variable}`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-sky-300">
          <Header />
          <main className="container mx-auto p-4 pt-8 max-w-full">{children}</main>
        </div>
      </body>
    </html>
  )
}



import './globals.css'