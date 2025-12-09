-- Create vacation_requests table for tracking employee absence/vacation requests
CREATE TABLE IF NOT EXISTS vacation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vakantie', 'ziekte', 'verlof', 'anders')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vacation_requests_user_id ON vacation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_status ON vacation_requests(status);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_start_date ON vacation_requests(start_date);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_end_date ON vacation_requests(end_date);

-- Enable RLS
ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own vacation requests
CREATE POLICY "Users can view own vacation requests"
  ON vacation_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Admins and kantoorpersoneel can view all vacation requests
CREATE POLICY "Admins can view all vacation requests"
  ON vacation_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'kantoorpersoneel', 'superuser')
    )
  );

-- Policy: Users can create their own vacation requests
CREATE POLICY "Users can create own vacation requests"
  ON vacation_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own pending vacation requests
CREATE POLICY "Users can update own pending vacation requests"
  ON vacation_requests
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Policy: Admins can update any vacation request (for approving/rejecting)
CREATE POLICY "Admins can update all vacation requests"
  ON vacation_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'kantoorpersoneel', 'superuser')
    )
  );

-- Policy: Users can delete their own pending vacation requests
CREATE POLICY "Users can delete own pending vacation requests"
  ON vacation_requests
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

-- Policy: Admins can delete any vacation request
CREATE POLICY "Admins can delete all vacation requests"
  ON vacation_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'kantoorpersoneel', 'superuser')
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_vacation_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER vacation_requests_updated_at
  BEFORE UPDATE ON vacation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_vacation_requests_updated_at();
