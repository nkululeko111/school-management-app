-- Fix RLS policies to allow onboarding process
-- This migration adds specific policies for the onboarding flow

-- Allow anon users to create profiles during onboarding (only when no school exists)
CREATE POLICY "Allow anon to create admin profile during onboarding"
  ON profiles FOR INSERT
  TO anon
  WITH CHECK (
    role = 'admin' 
    AND NOT EXISTS (SELECT 1 FROM schools)
    AND id = auth.uid()
  );

-- Allow anon users to create schools during onboarding (only when no school exists)
CREATE POLICY "Allow anon to create school during onboarding"
  ON schools FOR INSERT
  TO anon
  WITH CHECK (NOT EXISTS (SELECT 1 FROM schools));

-- Update the existing admin profile creation policy to be more permissive during onboarding
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

CREATE POLICY "Allow profile creation for onboarding and admin management"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user is creating their own profile
    (id = auth.uid()) OR
    -- Allow if user is admin and creating other profiles
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Ensure the RPC function can bypass RLS completely
-- The function already has SECURITY DEFINER which should bypass RLS
-- But let's make sure it's properly configured
ALTER FUNCTION public.onboard_school_and_admin(uuid, text, text, text, text, text, text, text) 
SET search_path = public, auth;
