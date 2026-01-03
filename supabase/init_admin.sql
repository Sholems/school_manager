-- ==============================================================================
-- INITIAL SETUP SCRIPT
-- Run this in the Supabase SQL Editor AFTER creating your user in Authentication
-- ==============================================================================

-- 1. Create the School
-- This creates your school entry. You can change the name here.
INSERT INTO schools (name) 
VALUES ('Fruitful Vine Heritage Schools') 
ON CONFLICT DO NOTHING;

-- 2. Setup Admin User
-- Replace 'admin@school.com' with the email address you just signed up with!
DO $$
DECLARE
    v_school_id UUID;
    v_user_email TEXT := 'info@fruitfulvineheritageschools.org.ng'; -- <<< CHANGE THIS TO YOUR EMAIL
BEGIN
    -- Get the school ID we just created
    SELECT id INTO v_school_id FROM schools WHERE name = 'Fruitful Vine Heritage Schools' LIMIT 1;
    
    -- Insert the user into the public profile table with 'admin' role
    INSERT INTO users (id, email, role, school_id)
    SELECT id, email, 'admin', v_school_id
    FROM auth.users
    WHERE email = v_user_email
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'Admin user setup complete for % linked to school %', v_user_email, v_school_id;
END $$;
