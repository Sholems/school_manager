-- ==============================================================================
-- FIX SCHEMA MISMATCH: Align database columns with TypeScript types
-- Run this in Supabase SQL Editor
-- ==============================================================================

-- 1. Fix Settings table - Add missing columns and rename columns to match TypeScript types
-- First, add columns that don't exist
ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_media TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS watermark_media TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS director_signature TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS head_of_school_signature TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS tiled_watermark BOOLEAN DEFAULT FALSE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS next_term_begins TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS class_teacher_label TEXT DEFAULT 'Class Teacher';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS head_teacher_label TEXT DEFAULT 'Head Teacher';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS report_font_family TEXT DEFAULT 'Inter';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS report_scale NUMERIC DEFAULT 1;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_sort_code TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS promotion_rules TEXT DEFAULT 'auto';

-- Landing Page CMS columns
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_hero_title TEXT DEFAULT 'Welcome to Our School';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_hero_subtitle TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_features TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_hero_image TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_about_text TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_primary_color TEXT DEFAULT '#1A3A5C';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_show_stats BOOLEAN DEFAULT TRUE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_cta_text TEXT DEFAULT 'Apply Now';

-- Role permissions (stored as JSONB)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS role_permissions JSONB DEFAULT '{}'::JSONB;

-- 2. Migrate data from old column names to new ones (if old columns exist and have data)
DO $$
BEGIN
    -- Copy logo_url to logo_media if logo_url exists and logo_media is null
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='logo_url') THEN
        UPDATE settings SET logo_media = logo_url WHERE logo_media IS NULL AND logo_url IS NOT NULL;
    END IF;
    
    -- Copy watermark_url to watermark_media if watermark_url exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='watermark_url') THEN
        UPDATE settings SET watermark_media = watermark_url WHERE watermark_media IS NULL AND watermark_url IS NOT NULL;
    END IF;
    
    -- Copy director_signature_url to director_signature
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='director_signature_url') THEN
        UPDATE settings SET director_signature = director_signature_url WHERE director_signature IS NULL AND director_signature_url IS NOT NULL;
    END IF;
    
    -- Copy head_of_school_signature_url to head_of_school_signature
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='head_of_school_signature_url') THEN
        UPDATE settings SET head_of_school_signature = head_of_school_signature_url WHERE head_of_school_signature IS NULL AND head_of_school_signature_url IS NOT NULL;
    END IF;
END $$;

-- 3. Verify settings table has a default row (required for the app to function)
INSERT INTO settings (school_name, school_email, current_session, current_term)
SELECT 'Fruitful Vine Heritage Schools', 'info@fruitfulvine.edu.ng', '2025/2026', 'Second Term'
WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1);

-- 4. Add password column to students table for portal access
ALTER TABLE students ADD COLUMN IF NOT EXISTS password TEXT;

-- ==============================================================================
-- VERIFY RLS POLICIES ARE PROPERLY SET
-- ==============================================================================

-- Drop existing policies (if any) and recreate them
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop through all tables and ensure they have proper authenticated access
    FOR r IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') LOOP
        -- Drop existing policy if exists
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS "authenticated_access" ON %I', r.table_name);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors
        END;
        
        -- Create new policy
        BEGIN
            EXECUTE format('CREATE POLICY "authenticated_access" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', r.table_name);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create policy for %: %', r.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ==============================================================================
-- VERIFY CLASSES EXIST
-- ==============================================================================
SELECT 'Classes count: ' || COUNT(*) FROM classes;

-- ==============================================================================
-- DONE - Refresh your browser to see the changes
-- ==============================================================================
