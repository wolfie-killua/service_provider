"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Calendar, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react"
import CreateServiceModal from "@/components/create-service-modal"
import { supabase, type Service } from "@/lib/supabase"

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const tabs = [
    { id: "all", label: "ALL SERVICES", icon: Calendar },
    { id: "available", label: "AVAILABLE SERVICES", icon: CheckCircle },
    { id: "request", label: "SERVICE REQUEST", icon: Clock },
    { id: "booked", label: "BOOKED SERVICES", icon: CheckCircle },
    { id: "denied", label: "DENIED REQUEST", icon: XCircle },
    { id: "expired", label: "EXPIRED SERVICES", icon: AlertTriangle },
  ]

  useEffect(() => {
    async function fetchServices() {
      setLoading(true)
      try {
        // Get current date for comparing with available_date
        const today = new Date().toISOString().split("T")[0]

        // Fetch all services first
        const { data, error } = await supabase
          .from("provider_services")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error

        let filteredServices = data as Service[]

        // Filter based on the active tab
        if (activeTab !== "all") {
          if (activeTab === "expired") {
            // For expired tab, filter services where available_date is in the past
            filteredServices = filteredServices.filter((service) => {
              const serviceDate = new Date(service.available_date).toISOString().split("T")[0]
              return serviceDate < today && service.status === "available"
            })
          } else {
            // For other tabs, filter by status
            const statusMap: Record<string, string> = {
              available: "available",
              request: "requested",
              booked: "booked",
              denied: "denied",
            }

            if (statusMap[activeTab]) {
              filteredServices = filteredServices.filter((service) => service.status === statusMap[activeTab])

              // For available services, also ensure the date is not in the past
              if (activeTab === "available") {
                filteredServices = filteredServices.filter((service) => {
                  const serviceDate = new Date(service.available_date).toISOString().split("T")[0]
                  return serviceDate >= today
                })
              }
            }
          }
        }

        setServices(filteredServices)
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [activeTab])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border border-green-200"
      case "booked":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "requested":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "denied":
        return "bg-red-100 text-red-800 border border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  // Check if a service is expired (available date in the past)
  const isExpiredService = (service: Service) => {
    const today = new Date().toISOString().split("T")[0]
    const serviceDate = new Date(service.available_date).toISOString().split("T")[0]
    return serviceDate < today && service.status === "available"
  }

  return (
    <>
      <div className="w-full">
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-xl border border-white/50 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id ? "bg-blue-500 text-white shadow-md" : "text-blue-800 hover:bg-blue-50"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-blue-800">{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                CREATE SERVICES
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-blue-300 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                <p className="text-blue-800">Loading services...</p>
              </div>
            ) : services.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-blue-100"
                    onClick={() => router.push(`/services/${service.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                          {isExpiredService(service) ? (
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                          ) : (
                            <Calendar className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-blue-800">{service.priest_name}</h3>
                          <div className="mt-1 text-sm text-gray-600">
                            <p className="flex items-center gap-1">
                              <span className="font-medium">Date:</span>{" "}
                              {new Date(service.available_date).toLocaleDateString()}
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="font-medium">Venue:</span> {service.church_venue}
                            </p>
                            {service.package_id && (
                              <p className="flex items-center gap-1">
                                <span className="font-medium">Package ID:</span> {service.package_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          isExpiredService(service)
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : getStatusBadgeClass(service.status)
                        }`}
                      >
                        {isExpiredService(service)
                          ? "Expired"
                          : service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/70 rounded-lg border border-blue-100">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === "denied" ? (
                    <XCircle className="w-8 h-8 text-blue-500" />
                  ) : activeTab === "expired" ? (
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  ) : (
                    <Calendar className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                <p className="text-blue-800 text-lg">No services found for this category.</p>
                <p className="text-blue-600 mt-2">
                  {activeTab === "expired" ? "No expired services found." : "Create a new service to get started."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          // Refresh the services list when modal is closed
          router.refresh()
        }}
      />
    </>
  )
}

