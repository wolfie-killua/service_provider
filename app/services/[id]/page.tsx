"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase, type Service } from "@/lib/supabase"
import { notFound } from "next/navigation"
import {
  Calendar,
  MapPin,
  User,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { createNotificationMessage } from "@/lib/notification-utils"

interface ServiceDetailPageProps {
  params: { id: string }
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  // Fetch service data
  useEffect(() => {
    async function fetchService() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("provider_services").select("*").eq("id", params.id).single()

        if (error) throw error
        setService(data as Service)
      } catch (error) {
        console.error("Error fetching service:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-100/80 backdrop-blur-md rounded-lg shadow-xl border border-white/50 overflow-hidden p-12">
          <div className="flex justify-center items-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-300 border-t-blue-500 rounded-full"></div>
            <span className="ml-3 text-blue-800">Loading service details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    notFound()
  }

  // Check if service is expired (available date is in the past)
  const isExpired = () => {
    const today = new Date().toISOString().split("T")[0]
    const serviceDate = new Date(service.available_date).toISOString().split("T")[0]
    return serviceDate < today && service.status === "available"
  }

  const getStatusIcon = (status: string) => {
    if (isExpired()) {
      return <AlertTriangle className="w-5 h-5 text-orange-600" />
    }

    switch (status) {
      case "available":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "booked":
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case "requested":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "denied":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusClass = (status: string) => {
    if (isExpired()) {
      return "bg-orange-100 text-orange-800 border-orange-200"
    }

    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "booked":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "requested":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "denied":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Handle accept request action
  const handleAcceptRequest = async () => {
    setActionLoading(true)
    try {
      // Update service status to booked
      const { error } = await supabase
        .from("provider_services")
        .update({
          status: "booked",
          book_date: new Date().toISOString(),
        })
        .eq("id", service.id)

      if (error) throw error

      // Create notification
      await supabase.from("notifications").insert({
        message: createNotificationMessage("booked", service.package_id, { bookedBy: service.book_by }),
        read: false,
      })

      // Update local state
      setService({
        ...service,
        status: "booked",
        book_date: new Date().toISOString(),
      })

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error accepting request:", error)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle reject request action
  const handleRejectRequest = async () => {
    setActionLoading(true)
    try {
      // Update service status to denied
      const { error } = await supabase
        .from("provider_services")
        .update({
          status: "denied",
        })
        .eq("id", service.id)

      if (error) throw error

      // Create notification
      await supabase.from("notifications").insert({
        message: createNotificationMessage("denied", service.package_id),
        read: false,
      })

      // Update local state
      setService({
        ...service,
        status: "denied",
      })

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error rejecting request:", error)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle make available again action
  const handleMakeAvailable = async () => {
    setActionLoading(true)
    try {
      // Update service status to available
      const { error } = await supabase
        .from("provider_services")
        .update({
          status: "available",
          book_by: null,
          book_date: null,
        })
        .eq("id", service.id)

      if (error) throw error

      // Create notification
      await supabase.from("notifications").insert({
        message: createNotificationMessage("available", service.package_id),
        read: false,
      })

      // Update local state
      setService({
        ...service,
        status: "available",
        book_by: null,
        book_date: null,
      })

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error making service available:", error)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle expired service notification
  const handleExpiredNotification = async () => {
    if (!isExpired()) return

    setActionLoading(true)
    try {
      // Create notification
      await supabase.from("notifications").insert({
        message: createNotificationMessage("expired", service.package_id, {
          date: new Date(service.available_date).toLocaleDateString(),
        }),
        read: false,
      })

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error creating expired notification:", error)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-blue-100/80 backdrop-blur-md rounded-lg shadow-xl border border-white/50 overflow-hidden">
        {/* Back button */}
        <div className="p-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-md text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
        </div>

        <div className="bg-blue-500/20 p-6 border-b border-blue-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Service Details</h1>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusClass(service.status)}`}>
              {getStatusIcon(service.status)}
              <span className="font-medium capitalize">{isExpired() ? "Expired" : service.status}</span>
            </div>
          </div>
          <div className="bg-white/80 p-4 rounded-full shadow-lg">
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Action buttons for requested services */}
        {service.status === "requested" && (
          <div className="bg-yellow-50 p-4 border-b border-yellow-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-yellow-800">Service Request Pending</h2>
                <p className="text-yellow-700">
                  This service has been requested by {service.book_by}. Please accept or reject the request.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAcceptRequest}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  Accept
                </button>
                <button
                  onClick={handleRejectRequest}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action button for denied services */}
        {service.status === "denied" && (
          <div className="bg-red-50 p-4 border-b border-red-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-red-800">Service Request Denied</h2>
                <p className="text-red-700">
                  This service request has been denied. You can make it available again if needed.
                </p>
              </div>
              <div>
                <button
                  onClick={handleMakeAvailable}
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-5 h-5" />
                  Make Available Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action button for expired services */}
        {isExpired() && (
          <div className="bg-orange-50 p-4 border-b border-orange-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-orange-800">Service Expired</h2>
                <p className="text-orange-700">This service has expired. The available date is in the past.</p>
              </div>
              <div>
                <button
                  onClick={handleExpiredNotification}
                  disabled={actionLoading}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Notify Expiration
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priest Name */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-blue-50">
              <div className="flex items-center gap-3 mb-3 text-blue-700">
                <User className="w-5 h-5" />
                <h2 className="text-xl font-bold">Priest Name</h2>
              </div>
              <p className="text-gray-700 text-lg pl-8">{service.priest_name}</p>
            </div>

            {/* Created At */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-blue-50">
              <div className="flex items-center gap-3 mb-3 text-blue-700">
                <Clock className="w-5 h-5" />
                <h2 className="text-xl font-bold">Created At</h2>
              </div>
              <p className="text-gray-700 text-lg pl-8">
                {new Date(service.created_at).toLocaleDateString()} at{" "}
                {new Date(service.created_at).toLocaleTimeString()}
              </p>
            </div>

            {/* Available Date */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-blue-50">
              <div className="flex items-center gap-3 mb-3 text-blue-700">
                <Calendar className="w-5 h-5" />
                <h2 className="text-xl font-bold">Available Date</h2>
              </div>
              <p className="text-gray-700 text-lg pl-8">
                {new Date(service.available_date).toLocaleDateString()}
                {isExpired() && <span className="ml-2 text-sm text-orange-600 font-medium">(Expired)</span>}
              </p>
            </div>

            {/* Church Venue */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-blue-50">
              <div className="flex items-center gap-3 mb-3 text-blue-700">
                <MapPin className="w-5 h-5" />
                <h2 className="text-xl font-bold">Church Venue</h2>
              </div>
              <p className="text-gray-700 text-lg pl-8">{service.church_venue}</p>
            </div>

            {/* Package ID */}
            {service.package_id && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-blue-50">
                <div className="flex items-center gap-3 mb-3 text-blue-700">
                  <Calendar className="w-5 h-5" />
                  <h2 className="text-xl font-bold">Package ID</h2>
                </div>
                <p className="text-gray-700 text-lg pl-8">{service.package_id}</p>
              </div>
            )}

            {/* Conditional rendering for booked services */}
            {service.book_by && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-blue-50">
                <div className="flex items-center gap-3 mb-3 text-blue-700">
                  <User className="w-5 h-5" />
                  <h2 className="text-xl font-bold">Booked By</h2>
                </div>
                <p className="text-gray-700 text-lg pl-8">{service.book_by}</p>
              </div>
            )}

            {service.book_date && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-blue-50">
                <div className="flex items-center gap-3 mb-3 text-blue-700">
                  <Calendar className="w-5 h-5" />
                  <h2 className="text-xl font-bold">Booking Date</h2>
                </div>
                <p className="text-gray-700 text-lg pl-8">{new Date(service.book_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

