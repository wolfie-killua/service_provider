"use client"

import { useState, useEffect } from "react"
import { supabase, type Notification } from "@/lib/supabase"
import { Bell, CheckCircle, Clock, XCircle, AlertTriangle, Calendar, Check } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setNotifications(data as Notification[])
    } catch (error) {
      console.error("Error fetching notifications:", error)
      // If there's an error, use empty array
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  // Helper function to determine notification icon based on message content
  function getNotificationIcon(message: string) {
    if (message.includes("created")) {
      return <Calendar className="w-5 h-5 text-blue-500" />
    } else if (message.includes("requested")) {
      return <Clock className="w-5 h-5 text-yellow-500" />
    } else if (message.includes("booked")) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (message.includes("denied")) {
      return <XCircle className="w-5 h-5 text-red-500" />
    } else if (message.includes("expired")) {
      return <AlertTriangle className="w-5 h-5 text-orange-500" />
    } else if (message.includes("available again")) {
      return <Calendar className="w-5 h-5 text-blue-500" />
    } else {
      return <Bell className="w-5 h-5 text-blue-500" />
    }
  }

  // Helper function to determine notification background color based on message content
  function getNotificationClass(message: string) {
    if (message.includes("created")) {
      return "bg-blue-50 border-blue-100"
    } else if (message.includes("requested")) {
      return "bg-yellow-50 border-yellow-100"
    } else if (message.includes("booked")) {
      return "bg-green-50 border-green-100"
    } else if (message.includes("denied")) {
      return "bg-red-50 border-red-100"
    } else if (message.includes("expired")) {
      return "bg-orange-50 border-orange-100"
    } else if (message.includes("available again")) {
      return "bg-blue-50 border-blue-100"
    } else {
      return "bg-white border-blue-100"
    }
  }

  // Mark notification as read
  const markAsRead = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }))
    try {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)

      if (error) throw error

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-xl border border-white/50 overflow-hidden">
        <div className="bg-blue-500/20 p-6 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="bg-white/80 p-2 rounded-full shadow-md">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-blue-800">Notifications</h1>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-300 border-t-blue-500 rounded-full mx-auto mb-4"></div>
              <p className="text-blue-800">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg shadow-md border hover:shadow-lg transition-all ${getNotificationClass(notification.message)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-full mt-1 shadow-sm">
                      {getNotificationIcon(notification.message)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">{notification.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString()} at{" "}
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </p>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              disabled={actionLoading[notification.id]}
                              className="bg-blue-500 text-white text-xs px-3 py-1 rounded-md flex items-center gap-1 hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-blue-800 text-lg">You have no new notifications.</p>
              <p className="text-blue-600 mt-2">Check back later for updates on your services.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

