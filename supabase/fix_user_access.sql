-- ==============================================================================
-- FIX USER ACCESS
-- Run this if you are logged in but cannot see data (Classes, etc.)
-- This ensures your User User exists in the 'public.users' table linked to the School.
-- ==============================================================================

DO $$
DECLARE
    v_school_id UUID;
    v_missing_count INTEGER;
BEGIN
    -- 1. Get the School ID
    SELECT id INTO v_school_id FROM schools WHERE name = 'Fruitful Vine Heritage Schools' LIMIT 1;

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'School not found! Please run init_admin.sql (or create the school manually).';
    END IF;

    -- 2. Find users in auth.users who are NOT in public.users
    -- And insert them as Admins for this school
    
    INSERT INTO public.users (id, email, role, school_id, created_at, updated_at)
    SELECT 
        au.id, 
        au.email, 
        'admin', -- Defaulting to Admin to ensure access
        v_school_id,
        NOW(),
        NOW()
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id);

    GET DIAGNOSTICS v_missing_count = ROW_COUNT;

    RAISE NOTICE 'Fixed % missing users. They are now linked to school %', v_missing_count, v_school_id;

    -- 3. Also verify default settings exist (JIC)
    PERFORM 1 FROM settings WHERE school_id = v_school_id;
    IF NOT FOUND THEN
         RAISE NOTICE 'WARNING: Settings for this school are still missing. Run seed_settings.sql!';
    END IF;

END $$;
