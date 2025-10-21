-- Complete fix for onboarding flow
-- This migration fixes all RLS policies to allow proper onboarding

-- 1. Allow anon users to read schools (for checking if school exists)
CREATE POLICY "Allow anon to read schools for onboarding check"
  ON schools FOR SELECT
  TO anon
  USING (true);

-- 2. Allow anon users to create school during onboarding (only when no school exists)
CREATE POLICY "Allow anon to create school during onboarding"
  ON schools FOR INSERT
  TO anon
  WITH CHECK (NOT EXISTS (SELECT 1 FROM schools));

-- 3. Allow anon users to create admin profile during onboarding
CREATE POLICY "Allow anon to create admin profile during onboarding"
  ON profiles FOR INSERT
  TO anon
  WITH CHECK (
    role = 'admin' 
    AND id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM schools)
  );

-- 4. Update the RPC function to be more robust
CREATE OR REPLACE FUNCTION public.onboard_school_and_admin(
  p_user_id uuid,
  p_school_name text,
  p_school_email text,
  p_school_address text,
  p_school_phone text,
  p_school_logo text,
  p_admin_full_name text,
  p_admin_email text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  -- Prevent onboarding if a school already exists
  IF EXISTS (SELECT 1 FROM public.schools) THEN
    RAISE EXCEPTION 'School already exists';
  END IF;

  -- Create school
  INSERT INTO public.schools (name, email, address, phone, logo_url)
  VALUES (p_school_name, p_school_email, p_school_address, p_school_phone, p_school_logo)
  RETURNING id INTO v_school_id;

  -- Create admin profile for the supplied auth user id
  INSERT INTO public.profiles (id, email, full_name, role, school_id)
  VALUES (p_user_id, p_admin_email, p_admin_full_name, 'admin', v_school_id);

  RETURN v_school_id;
END;
$$;

-- 5. Grant proper permissions for the RPC function
REVOKE ALL ON FUNCTION public.onboard_school_and_admin(uuid, text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.onboard_school_and_admin(uuid, text, text, text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.onboard_school_and_admin(uuid, text, text, text, text, text, text, text) TO authenticated;

-- 6. Fix the existing school creation policy to be less restrictive
DROP POLICY IF EXISTS "Only admins can insert school" ON schools;
CREATE POLICY "Allow school creation for onboarding and admin management"
  ON schools FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if no school exists (onboarding)
    NOT EXISTS (SELECT 1 FROM schools) OR
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 7. Fix the existing profile creation policy
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

-- 8. Ensure anon users can read schools for the check
DROP POLICY IF EXISTS "Authenticated users can view school" ON schools;
CREATE POLICY "Allow reading schools"
  ON schools FOR SELECT
  TO authenticated, anon
  USING (true);
