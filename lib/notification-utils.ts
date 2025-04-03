export function createNotificationMessage(
  type: string,
  packageId: number | undefined,
  details: Record<string, any> = {},
) {
  if (!packageId) packageId = 0

  switch (type) {
    case "created":
      return `Service Package #${packageId} is created with this information (${details.priestName || ""}, ${details.date || ""}, ${details.venue || ""}).`

    case "requested":
      return `Service Package #${packageId} is requested by ${details.requestedBy || ""}.`

    case "booked":
      return `Service Package #${packageId} is booked by ${details.bookedBy || ""}.`

    case "denied":
      return `Service Package #${packageId} is denied.`

    case "available":
      return `Service Package #${packageId} is now available again.`

    case "expired":
      return `Service Package #${packageId} is expired (${details.date || ""}).`

    default:
      return `Notification about Service Package #${packageId}.`
  }
}

