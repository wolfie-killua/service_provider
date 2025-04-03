"use client"

import { useState, useEffect } from "react"
import { X, Calendar, MapPin, User, Package } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { createNotificationMessage } from "@/lib/notification-utils"

interface CreateServiceModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateServiceModal({ isOpen, onClose }: CreateServiceModalProps) {
  const [priestName, setPriestName] = useState("")
  const [availableDate, setAvailableDate] = useState("")
  const [churchVenue, setChurchVenue] = useState("")
  const [packageId, setPackageId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    // Fetch the max package_id and increment by 1
    async function getNextPackageId() {
      if (!isOpen) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("provider_services")
          .select("package_id")
          .order("package_id", { ascending: false })
          .limit(1)

        if (error) throw error

        // If there are no existing records, start with 1
        // Otherwise, increment the highest package_id by 1
        let nextId = 1
        if (data && data.length > 0 && data[0].package_id) {
          nextId = Number(data[0].package_id) + 1
        }

        setPackageId(nextId)
      } catch (error) {
        console.error("Error fetching next package ID:", error)
        setPackageId(1) // Default to 1 if there's an error
      } finally {
        setIsLoading(false)
      }
    }

    getNextPackageId()
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Create the service with the new package_id
      const { error } = await supabase.from("provider_services").insert({
        priest_name: priestName,
        available_date: availableDate,
        church_venue: churchVenue,
        status: "available",
        book_by: null,
        book_date: null,
        package_id: packageId,
      })

      if (error) throw error

      // Create a notification for the new service
      await supabase.from("notifications").insert({
        message: createNotificationMessage("created", packageId, {
          priestName: priestName,
          date: new Date(availableDate).toLocaleDateString(),
          venue: churchVenue,
        }),
        read: false,
      })

      // Reset form and close modal
      setPriestName("")
      setAvailableDate("")
      setChurchVenue("")
      onClose()

      // Refresh the page to show new data
      router.refresh()
    } catch (error) {
      console.error("Error creating service:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-lg w-full max-w-md shadow-2xl border border-white/50 overflow-hidden">
        <div className="relative bg-blue-500 flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-bold text-white">Create Service</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin w-8 h-8 border-4 border-blue-300 border-t-blue-500 rounded-full mx-auto mb-2"></div>
              <p className="text-blue-700">Loading...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium text-blue-700">Package ID</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-2 pl-10 border border-blue-200 rounded-md bg-gray-50"
                    value={packageId || ""}
                    disabled
                  />
                  <Package className="absolute left-3 top-2.5 text-blue-500 w-5 h-5" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-generated package ID</p>
              </div>

              <div>
                <label className="block mb-2 font-medium text-blue-700">Priest Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter priest name"
                    className="w-full p-2 pl-10 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    value={priestName}
                    onChange={(e) => setPriestName(e.target.value)}
                  />
                  <User className="absolute left-3 top-2.5 text-blue-500 w-5 h-5" />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-blue-700">Available Date</label>
                <div className="relative">
                  <input
                    type="date"
                    placeholder="mm/dd/yyyy"
                    className="w-full p-2 pl-10 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    value={availableDate}
                    onChange={(e) => setAvailableDate(e.target.value)}
                    min={today} // Restrict to future dates only
                  />
                  <Calendar className="absolute left-3 top-2.5 text-blue-500 w-5 h-5" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Only future dates are allowed</p>
              </div>

              <div>
                <label className="block mb-2 font-medium text-blue-700">Church Venue</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter church venue"
                    className="w-full p-2 pl-10 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    value={churchVenue}
                    onChange={(e) => setChurchVenue(e.target.value)}
                  />
                  <MapPin className="absolute left-3 top-2.5 text-blue-500 w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading || !priestName || !availableDate || !churchVenue}
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-all duration-200 font-medium shadow-md"
            >
              {isSubmitting ? "Creating..." : "Create Service"}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-blue-700 hover:bg-blue-50 rounded-md transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

