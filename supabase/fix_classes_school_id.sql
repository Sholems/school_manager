-- ==============================================================================
-- FIX CLASSES SCHOOL ID
-- Run this if Year 1-6 classes are not showing in the admin portal
-- This updates the school_id of all classes to match the current user's school
-- ==============================================================================

DO $$
DECLARE
    v_school_id UUID;
    v_updated_count INTEGER;
BEGIN
    -- Get the school ID from the first school (should be consistent)
    SELECT id INTO v_school_id FROM schools WHERE name = 'Fruitful Vine Heritage Schools' LIMIT 1;

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'School not found! Please check the school name.';
    END IF;

    -- Update any classes that might have a different or NULL school_id
    UPDATE classes 
    SET school_id = v_school_id, updated_at = NOW()
    WHERE school_id IS NULL OR school_id != v_school_id;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    RAISE NOTICE 'Updated % classes to school_id: %', v_updated_count, v_school_id;

    -- Also output a summary of all classes
    RAISE NOTICE 'Current classes in database:';
    FOR v_updated_count IN 
        SELECT name FROM classes WHERE school_id = v_school_id ORDER BY name
    LOOP
        RAISE NOTICE '  - %', v_updated_count;
    END LOOP;

END $$;

-- Verify the classes are now accessible
SELECT id, name, school_id FROM classes ORDER BY name;
