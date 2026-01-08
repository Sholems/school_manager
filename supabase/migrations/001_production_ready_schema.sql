-- =============================================
-- PRODUCTION-READY SCHEMA MIGRATION
-- Run this in the Supabase SQL Editor
-- =============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- SCHOOLS TABLE (Multi-tenancy support)
-- =============================================
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default school if not exists
INSERT INTO schools (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Fruitful Vine Heritage Schools', 'fvhs')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ADD school_id TO ALL TABLES
-- =============================================

-- Add school_id to users if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'school_id') THEN
        ALTER TABLE users ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE users SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add school_id to settings if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'school_id') THEN
        ALTER TABLE settings ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE settings SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
        ALTER TABLE settings ADD CONSTRAINT settings_school_unique UNIQUE (school_id);
    END IF;
END $$;

-- Add school_id to classes if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'school_id') THEN
        ALTER TABLE classes ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE classes SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add school_id to teachers if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachers' AND column_name = 'school_id') THEN
        ALTER TABLE teachers ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE teachers SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add school_id to staff if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'school_id') THEN
        ALTER TABLE staff ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE staff SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add school_id to students if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'school_id') THEN
        ALTER TABLE students ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE students SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add password_hash to students for secure password storage
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'password_hash') THEN
        ALTER TABLE students ADD COLUMN password_hash TEXT;
    END IF;
END $$;

-- Add school_id to scores if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scores' AND column_name = 'school_id') THEN
        ALTER TABLE scores ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE scores SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add school_id to fees if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fees' AND column_name = 'school_id') THEN
        ALTER TABLE fees ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE fees SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add school_id to payments if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'school_id') THEN
        ALTER TABLE payments ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE payments SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add school_id to expenses if not exists
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    category TEXT CHECK (category IN ('salary', 'maintenance', 'supplies', 'utilities', 'other')),
    date DATE NOT NULL,
    description TEXT,
    session TEXT NOT NULL,
    term TEXT NOT NULL,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add school_id to attendance if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'school_id') THEN
        ALTER TABLE attendance ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE attendance SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add school_id to admissions if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'school_id') THEN
        ALTER TABLE admissions ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE admissions SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add school_id to announcements if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'school_id') THEN
        ALTER TABLE announcements ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE announcements SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add school_id to events if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'school_id') THEN
        ALTER TABLE events ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE events SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- Add school_id to subject_teachers if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subject_teachers' AND column_name = 'school_id') THEN
        ALTER TABLE subject_teachers ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
        UPDATE subject_teachers SET school_id = '00000000-0000-0000-0000-000000000001' WHERE school_id IS NULL;
    END IF;
END $$;

-- =============================================
-- NEWSLETTERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT, -- URL to R2 storage instead of base64
    file_name TEXT,
    session TEXT NOT NULL,
    term TEXT NOT NULL,
    published_by UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADD MISSING SETTINGS COLUMNS
-- =============================================

-- Add CMS columns to settings
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'logo_media') THEN
        ALTER TABLE settings ADD COLUMN logo_media TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'watermark_media') THEN
        ALTER TABLE settings ADD COLUMN watermark_media TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'director_signature') THEN
        ALTER TABLE settings ADD COLUMN director_signature TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'head_of_school_signature') THEN
        ALTER TABLE settings ADD COLUMN head_of_school_signature TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'tiled_watermark') THEN
        ALTER TABLE settings ADD COLUMN tiled_watermark BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'next_term_begins') THEN
        ALTER TABLE settings ADD COLUMN next_term_begins TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'class_teacher_label') THEN
        ALTER TABLE settings ADD COLUMN class_teacher_label TEXT DEFAULT 'Class Teacher';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'head_teacher_label') THEN
        ALTER TABLE settings ADD COLUMN head_teacher_label TEXT DEFAULT 'Head of School';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'report_font_family') THEN
        ALTER TABLE settings ADD COLUMN report_font_family TEXT DEFAULT 'inherit';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'report_scale') THEN
        ALTER TABLE settings ADD COLUMN report_scale INTEGER DEFAULT 100;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'promotion_rules') THEN
        ALTER TABLE settings ADD COLUMN promotion_rules TEXT DEFAULT 'manual';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'bank_sort_code') THEN
        ALTER TABLE settings ADD COLUMN bank_sort_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'role_permissions') THEN
        ALTER TABLE settings ADD COLUMN role_permissions JSONB DEFAULT '{}'::JSONB;
    END IF;
    -- Landing page CMS columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'landing_hero_title') THEN
        ALTER TABLE settings ADD COLUMN landing_hero_title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'landing_hero_subtitle') THEN
        ALTER TABLE settings ADD COLUMN landing_hero_subtitle TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'landing_features') THEN
        ALTER TABLE settings ADD COLUMN landing_features TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'landing_hero_image') THEN
        ALTER TABLE settings ADD COLUMN landing_hero_image TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'landing_about_text') THEN
        ALTER TABLE settings ADD COLUMN landing_about_text TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'landing_gallery_images') THEN
        ALTER TABLE settings ADD COLUMN landing_gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'landing_primary_color') THEN
        ALTER TABLE settings ADD COLUMN landing_primary_color TEXT DEFAULT '#1A3A5C';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'landing_show_stats') THEN
        ALTER TABLE settings ADD COLUMN landing_show_stats BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'landing_cta_text') THEN
        ALTER TABLE settings ADD COLUMN landing_cta_text TEXT DEFAULT 'Start Your Journey';
    END IF;
END $$;

-- =============================================
-- DROP OLD PERMISSIVE RLS POLICIES
-- =============================================

-- Drop existing policies safely
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "authenticated_access" ON users;
    DROP POLICY IF EXISTS "authenticated_access" ON settings;
    DROP POLICY IF EXISTS "authenticated_access" ON classes;
    DROP POLICY IF EXISTS "authenticated_access" ON teachers;
    DROP POLICY IF EXISTS "authenticated_access" ON staff;
    DROP POLICY IF EXISTS "authenticated_access" ON students;
    DROP POLICY IF EXISTS "authenticated_access" ON scores;
    DROP POLICY IF EXISTS "authenticated_access" ON fees;
    DROP POLICY IF EXISTS "authenticated_access" ON payments;
    DROP POLICY IF EXISTS "authenticated_access" ON attendance;
    DROP POLICY IF EXISTS "authenticated_access" ON admissions;
    DROP POLICY IF EXISTS "authenticated_access" ON announcements;
    DROP POLICY IF EXISTS "authenticated_access" ON events;
    DROP POLICY IF EXISTS "authenticated_access" ON subject_teachers;
END $$;

-- =============================================
-- SECURE RLS POLICIES WITH SCHOOL_ID FILTERING
-- =============================================

-- Helper function to get current user's school_id
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
DECLARE
    school UUID;
BEGIN
    SELECT school_id INTO school FROM users WHERE id = auth.uid();
    RETURN school;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users: Can only see/modify users from same school
CREATE POLICY "users_school_isolation" ON users
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Settings: Can only access own school's settings
CREATE POLICY "settings_school_isolation" ON settings
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Classes: School isolation
CREATE POLICY "classes_school_isolation" ON classes
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Teachers: School isolation
CREATE POLICY "teachers_school_isolation" ON teachers
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Staff: School isolation
CREATE POLICY "staff_school_isolation" ON staff
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Students: School isolation
CREATE POLICY "students_school_isolation" ON students
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Scores: School isolation
CREATE POLICY "scores_school_isolation" ON scores
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Fees: School isolation
CREATE POLICY "fees_school_isolation" ON fees
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Payments: School isolation
CREATE POLICY "payments_school_isolation" ON payments
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Expenses: School isolation
CREATE POLICY "expenses_school_isolation" ON expenses
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Attendance: School isolation
CREATE POLICY "attendance_school_isolation" ON attendance
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Admissions: School isolation
CREATE POLICY "admissions_school_isolation" ON admissions
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Announcements: School isolation
CREATE POLICY "announcements_school_isolation" ON announcements
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Events: School isolation
CREATE POLICY "events_school_isolation" ON events
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Subject Teachers: School isolation
CREATE POLICY "subject_teachers_school_isolation" ON subject_teachers
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- Newsletters: School isolation
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "newsletters_school_isolation" ON newsletters
    FOR ALL TO authenticated
    USING (school_id = get_user_school_id())
    WITH CHECK (school_id = get_user_school_id());

-- =============================================
-- PASSWORD HASHING FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION hash_student_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(plain_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verify_student_password(plain_password TEXT, hashed_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN hashed_password = crypt(plain_password, hashed_password);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_settings_school ON settings(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_staff_school ON staff(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_scores_school ON scores(school_id);
CREATE INDEX IF NOT EXISTS idx_fees_school ON fees(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_school ON payments(school_id);
CREATE INDEX IF NOT EXISTS idx_expenses_school ON expenses(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_school ON attendance(school_id);
CREATE INDEX IF NOT EXISTS idx_admissions_school ON admissions(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_school ON announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_events_school ON events(school_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_school ON newsletters(school_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_students_school_class ON students(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_scores_school_session_term ON scores(school_id, session, term);
CREATE INDEX IF NOT EXISTS idx_payments_school_session_term ON payments(school_id, session, term);
CREATE INDEX IF NOT EXISTS idx_attendance_school_date ON attendance(school_id, date);

-- =============================================
-- TRIGGER FOR UPDATED_AT ON NEW TABLES
-- =============================================

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE ON newsletters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
