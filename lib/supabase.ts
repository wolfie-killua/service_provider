import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://gzqzzlaottcsnlqzkljq.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6cXp6bGFvdHRjc25scXprbGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY1ODg2NCwiZXhwIjoyMDU5MjM0ODY0fQ.sXJkgK0rfSRSPBByKq2q5hBIvQnTXsnN9-3w3cDNoZk"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our database tables
export type Service = {
  id: string
  priest_name: string
  available_date: string
  church_venue: string
  status: "available" | "booked" | "denied" | "requested" | "expired"
  book_by: string | null
  book_date: string | null
  created_at: string
  package_id?: number
}

export type Notification = {
  id: string
  message: string
  read: boolean
  created_at: string
  type?: string
}

