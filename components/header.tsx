"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Bell } from "lucide-react"
import Image from "next/image"

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white/20 backdrop-blur-md text-white p-4 shadow-lg border-b border-white/30">
      <div className="container mx-auto flex justify-between items-center max-w-full px-4">
        <div className="flex items-center gap-2">
          <div className="bg-white/30 p-2 rounded-full shadow-md">
            <Image src="/images/cross-icon.png" alt="Cross icon" width={24} height={24} className="h-6 w-auto" />
          </div>
          <div className="text-xl font-cinzel font-bold tracking-wider text-white drop-shadow-md">
            KILLUA SERVICE PROVIDER
          </div>
        </div>
        <nav className="flex gap-4">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              pathname === "/" ? "bg-white/30 text-white shadow-md" : "hover:bg-white/20 text-white/90"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </Link>
          <Link
            href="/services"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              pathname.startsWith("/services") ? "bg-white/30 text-white shadow-md" : "hover:bg-white/20 text-white/90"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Services</span>
          </Link>
          <Link
            href="/notifications"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              pathname === "/notifications" ? "bg-white/30 text-white shadow-md" : "hover:bg-white/20 text-white/90"
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="font-medium">Notification</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

