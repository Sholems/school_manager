-- =============================================
-- SINGLE SCHOOL RLS POLICIES
-- Simplified Row Level Security for single-school deployment
-- Run this in the Supabase SQL Editor
-- =============================================

-- Enable pgcrypto for password functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- DROP MULTI-TENANT POLICIES
-- Remove complex school_id based policies
-- =============================================

-- Drop the multi-tenant helper function if it exists
DROP FUNCTION IF EXISTS get_auth_school_id() CASCADE;
DROP FUNCTION IF EXISTS get_user_school_id() CASCADE;

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Enable on optional tables (if they exist)
DO $$ BEGIN
    ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS subject_teachers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS newsletters ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- =============================================
-- SIMPLE POLICIES: Authenticated users can access all data
-- For a single school, this is appropriate - the security
-- boundary is authentication, not row-level isolation
-- =============================================

-- Users table - users can read their own data
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "authenticated_access" ON users;
CREATE POLICY "users_read_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- Settings - anyone authenticated can read, admins can modify
DROP POLICY IF EXISTS "authenticated_access" ON settings;
DROP POLICY IF EXISTS "public_read_settings" ON settings;
DROP POLICY IF EXISTS "admin_modify_settings" ON settings;
CREATE POLICY "settings_read" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_modify" ON settings FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Admissions - public can insert (for admission form), authenticated can manage
DROP POLICY IF EXISTS "authenticated_access" ON admissions;
DROP POLICY IF EXISTS "public_insert_admissions" ON admissions;
DROP POLICY IF EXISTS "admin_manage_admissions" ON admissions;
CREATE POLICY "admissions_public_insert" ON admissions FOR INSERT WITH CHECK (true);
CREATE POLICY "admissions_authenticated_read" ON admissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admissions_admin_modify" ON admissions FOR UPDATE TO authenticated 
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')));
CREATE POLICY "admissions_admin_delete" ON admissions FOR DELETE TO authenticated 
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- All other tables - authenticated users have full access
-- This is appropriate for single-school where all users belong to the same school

CREATE OR REPLACE FUNCTION drop_and_create_simple_policy(table_name text) 
RETURNS void AS $$
BEGIN
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_access" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "school_isolation_%s" ON %I', table_name, table_name);
    EXECUTE format('CREATE POLICY "authenticated_full_access" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', table_name);
EXCEPTION WHEN undefined_table THEN NULL;
END;
$$ LANGUAGE plpgsql;

SELECT drop_and_create_simple_policy('classes');
SELECT drop_and_create_simple_policy('teachers');
SELECT drop_and_create_simple_policy('staff');
SELECT drop_and_create_simple_policy('students');
SELECT drop_and_create_simple_policy('scores');
SELECT drop_and_create_simple_policy('fees');
SELECT drop_and_create_simple_policy('payments');
SELECT drop_and_create_simple_policy('attendance');
SELECT drop_and_create_simple_policy('announcements');
SELECT drop_and_create_simple_policy('events');
SELECT drop_and_create_simple_policy('expenses');
SELECT drop_and_create_simple_policy('subject_teachers');
SELECT drop_and_create_simple_policy('messages');
SELECT drop_and_create_simple_policy('newsletters');

DROP FUNCTION drop_and_create_simple_policy(text);

-- =============================================
-- PASSWORD HASHING FUNCTIONS
-- Required for student portal login
-- =============================================

CREATE OR REPLACE FUNCTION hash_student_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(plain_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION verify_student_password(plain_password TEXT, hashed_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN hashed_password = crypt(plain_password, hashed_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ESSENTIAL INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_student_no ON students(student_no);
CREATE INDEX IF NOT EXISTS idx_scores_student ON scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_session_term ON scores(session, term);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance(class_id, date);

-- =============================================
-- VERIFICATION
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Single-school RLS policies applied successfully';
    RAISE NOTICE '✅ Password functions created';
    RAISE NOTICE '✅ Essential indexes created';
END $$;
