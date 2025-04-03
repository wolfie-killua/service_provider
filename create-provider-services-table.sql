-- Create the provider_services table
CREATE TABLE provider_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  priest_name TEXT NOT NULL,
  available_date DATE NOT NULL,
  church_venue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'denied', 'requested', 'expired')),
  book_by TEXT,
  book_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  package_id INTEGER
);

-- Add Row Level Security (RLS) policies
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" 
ON provider_services 
FOR ALL 
TO authenticated 
USING (true);

-- Create a policy that allows read-only access for anonymous users
CREATE POLICY "Allow read-only access for anonymous users" 
ON provider_services 
FOR SELECT 
TO anon 
USING (true);

