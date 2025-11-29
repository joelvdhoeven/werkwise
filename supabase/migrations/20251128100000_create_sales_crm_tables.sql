-- Create sales_agents table for the sales CRM system
CREATE TABLE IF NOT EXISTS sales_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  naam TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'sales' CHECK (role IN ('sales', 'sales_admin')),
  commission_percentage NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create leads table for tracking potential customers
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'converted', 'paid', 'lost')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('onboarding', 'manual', 'referral')),
  assigned_to UUID REFERENCES sales_agents(id) ON DELETE SET NULL,
  created_by UUID REFERENCES sales_agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create lead_notes table for tracking notes/comments on leads
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES sales_agents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_agents_auth_user_id ON sales_agents(auth_user_id);

-- Enable RLS
ALTER TABLE sales_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales_agents
-- Sales agents can view all active agents
CREATE POLICY "sales_agents_select_all"
  ON sales_agents FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert new agents
CREATE POLICY "sales_agents_insert_admin"
  ON sales_agents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales_agents sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.role = 'sales_admin'
    )
  );

-- Only admins can update agents
CREATE POLICY "sales_agents_update_admin"
  ON sales_agents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales_agents sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.role = 'sales_admin'
    )
  );

-- RLS Policies for leads
-- Admins can see all leads, sales agents can see assigned leads
CREATE POLICY "leads_select"
  ON leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales_agents sa
      WHERE sa.auth_user_id = auth.uid()
      AND (sa.role = 'sales_admin' OR leads.assigned_to = sa.id)
    )
  );

-- Allow inserting leads (for onboarding form - anonymous or authenticated)
CREATE POLICY "leads_insert_public"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins and assigned agents can update leads
CREATE POLICY "leads_update"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales_agents sa
      WHERE sa.auth_user_id = auth.uid()
      AND (sa.role = 'sales_admin' OR leads.assigned_to = sa.id)
    )
  );

-- RLS Policies for lead_notes
-- View notes on accessible leads
CREATE POLICY "lead_notes_select"
  ON lead_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads l
      JOIN sales_agents sa ON sa.auth_user_id = auth.uid()
      WHERE l.id = lead_notes.lead_id
      AND (sa.role = 'sales_admin' OR l.assigned_to = sa.id)
    )
  );

-- Insert notes on accessible leads
CREATE POLICY "lead_notes_insert"
  ON lead_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads l
      JOIN sales_agents sa ON sa.auth_user_id = auth.uid()
      WHERE l.id = lead_id
      AND (sa.role = 'sales_admin' OR l.assigned_to = sa.id)
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_sales_crm_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sales_agents_updated_at
  BEFORE UPDATE ON sales_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_crm_updated_at();

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_crm_updated_at();
