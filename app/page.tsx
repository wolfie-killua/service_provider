import Link from "next/link"
import { Calendar, Bell } from "lucide-react"

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-xl border border-white/50 overflow-hidden">
        <div className="bg-blue-500/20 p-8 border-b border-blue-100">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Welcome to Killua Service Provider</h1>
          <p className="text-blue-600 text-lg">Connecting communities with spiritual services</p>
        </div>

        <div className="p-8">
          <p className="text-gray-600 mb-8 text-lg">
            Select an option from the navigation bar to get started with managing services and events.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/services" className="group">
              <div className="bg-white rounded-lg p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-200 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold text-blue-700">Manage Services</h2>
                </div>
                <p className="text-gray-600">
                  Create, view, and manage services. Schedule priests, set venues, and track service status.
                </p>
              </div>
            </Link>

            <Link href="/notifications" className="group">
              <div className="bg-white rounded-lg p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-200 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Bell className="w-6 h-6 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold text-blue-700">Notifications</h2>
                </div>
                <p className="text-gray-600">
                  Stay updated with service changes, booking confirmations, and important announcements.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

