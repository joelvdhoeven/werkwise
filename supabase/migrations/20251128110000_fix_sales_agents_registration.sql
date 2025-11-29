-- Fix RLS policy to allow users to register themselves as sales agents
-- Drop existing restrictive insert policy
DROP POLICY IF EXISTS "sales_agents_insert_admin" ON sales_agents;

-- Create new policy that allows:
-- 1. Users to insert their own profile (auth_user_id = auth.uid())
-- 2. Admins to insert any profile
CREATE POLICY "sales_agents_insert_self_or_admin"
  ON sales_agents FOR INSERT
  TO authenticated
  WITH CHECK (
    auth_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM sales_agents sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.role = 'sales_admin'
    )
  );

-- Update superuser@werkwise.nl to sales_admin if exists
UPDATE sales_agents
SET role = 'sales_admin'
WHERE email = 'superuser@werkwise.nl';
