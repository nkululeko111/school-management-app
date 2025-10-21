-- Onboarding RPC: create school and admin profile in one transaction
-- SECURITY DEFINER bypasses RLS but we add guards
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
SET search_path = public
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
  -- Use SECURITY DEFINER to bypass RLS for this specific operation
  INSERT INTO public.profiles (id, email, full_name, role, school_id)
  VALUES (p_user_id, p_admin_email, p_admin_full_name, 'admin', v_school_id);

  RETURN v_school_id;
END;
$$;

-- Allow anon to execute only when there is no school yet
REVOKE ALL ON FUNCTION public.onboard_school_and_admin(uuid, text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.onboard_school_and_admin(uuid, text, text, text, text, text, text, text) TO anon;

-- Also allow authenticated users to execute this function
GRANT EXECUTE ON FUNCTION public.onboard_school_and_admin(uuid, text, text, text, text, text, text, text) TO authenticated;
