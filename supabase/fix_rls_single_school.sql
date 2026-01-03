-- ==============================================================================
-- FIX RLS POLICIES FOR SINGLE SCHOOL MODE
-- Run this in Supabase SQL Editor to fix data access issues
-- 
-- PROBLEM: Old RLS policies may reference 'school_id' which no longer exists
-- SOLUTION: Replace all policies with simple authenticated access
-- ==============================================================================

-- First, drop policies that depend on the old function
DROP POLICY IF EXISTS "school_isolation_expenses" ON expenses;
DROP POLICY IF EXISTS "school_isolation_messages" ON messages;
DROP POLICY IF EXISTS "school_isolation_newsletters" ON newsletters;

-- Now drop the old function (with CASCADE to handle any remaining dependencies)
DROP FUNCTION IF EXISTS get_auth_school_id() CASCADE;

-- ==============================================================================
-- RESET ALL RLS POLICIES TO SIMPLE AUTHENTICATED ACCESS
-- ==============================================================================

-- USERS TABLE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON users;
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "admin_read_school_users" ON users;
CREATE POLICY "authenticated_access" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SETTINGS TABLE
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON settings;
DROP POLICY IF EXISTS "public_read_settings" ON settings;
DROP POLICY IF EXISTS "admin_modify_settings" ON settings;
CREATE POLICY "authenticated_access" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Also allow public read for landing page
CREATE POLICY "public_read_settings" ON settings FOR SELECT TO anon USING (true);

-- CLASSES TABLE
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON classes;
DROP POLICY IF EXISTS "school_isolation_classes" ON classes;
CREATE POLICY "authenticated_access" ON classes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TEACHERS TABLE
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON teachers;
DROP POLICY IF EXISTS "school_isolation_teachers" ON teachers;
CREATE POLICY "authenticated_access" ON teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- STAFF TABLE
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON staff;
DROP POLICY IF EXISTS "school_isolation_staff" ON staff;
CREATE POLICY "authenticated_access" ON staff FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- STUDENTS TABLE
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON students;
DROP POLICY IF EXISTS "school_isolation_students" ON students;
CREATE POLICY "authenticated_access" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SCORES TABLE
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON scores;
DROP POLICY IF EXISTS "school_isolation_scores" ON scores;
CREATE POLICY "authenticated_access" ON scores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- FEES TABLE
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON fees;
DROP POLICY IF EXISTS "school_isolation_fees" ON fees;
CREATE POLICY "authenticated_access" ON fees FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PAYMENTS TABLE
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON payments;
DROP POLICY IF EXISTS "school_isolation_payments" ON payments;
CREATE POLICY "authenticated_access" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ATTENDANCE TABLE
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON attendance;
DROP POLICY IF EXISTS "school_isolation_attendance" ON attendance;
CREATE POLICY "authenticated_access" ON attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ADMISSIONS TABLE
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON admissions;
DROP POLICY IF EXISTS "public_insert_admissions" ON admissions;
DROP POLICY IF EXISTS "admin_manage_admissions" ON admissions;
-- Public can submit admissions (anonymous)
CREATE POLICY "public_insert_admissions" ON admissions FOR INSERT TO anon WITH CHECK (true);
-- Authenticated users can manage all admissions
CREATE POLICY "authenticated_access" ON admissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ANNOUNCEMENTS TABLE
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON announcements;
DROP POLICY IF EXISTS "school_isolation_announcements" ON announcements;
CREATE POLICY "authenticated_access" ON announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- EVENTS TABLE
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON events;
DROP POLICY IF EXISTS "school_isolation_events" ON events;
CREATE POLICY "authenticated_access" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SUBJECT_TEACHERS TABLE
ALTER TABLE subject_teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_access" ON subject_teachers;
DROP POLICY IF EXISTS "school_isolation_subject_teachers" ON subject_teachers;
CREATE POLICY "authenticated_access" ON subject_teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- OPTIONAL: Handle tables that may or may not exist
-- ==============================================================================

DO $$
BEGIN
    -- EXPENSES TABLE (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
        ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
        EXECUTE 'DROP POLICY IF EXISTS "authenticated_access" ON expenses';
        EXECUTE 'DROP POLICY IF EXISTS "school_isolation_expenses" ON expenses';
        EXECUTE 'CREATE POLICY "authenticated_access" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true)';
    END IF;

    -- MESSAGES TABLE (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
        EXECUTE 'DROP POLICY IF EXISTS "authenticated_access" ON messages';
        EXECUTE 'DROP POLICY IF EXISTS "school_isolation_messages" ON messages';
        EXECUTE 'CREATE POLICY "authenticated_access" ON messages FOR ALL TO authenticated USING (true) WITH CHECK (true)';
    END IF;

    -- NEWSLETTERS TABLE (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletters') THEN
        ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
        EXECUTE 'DROP POLICY IF EXISTS "authenticated_access" ON newsletters';
        EXECUTE 'DROP POLICY IF EXISTS "school_isolation_newsletters" ON newsletters';
        EXECUTE 'CREATE POLICY "authenticated_access" ON newsletters FOR ALL TO authenticated USING (true) WITH CHECK (true)';
    END IF;
END $$;

-- ==============================================================================
-- VERIFICATION QUERIES
-- ==============================================================================

-- Check settings table has data
SELECT 'Settings count: ' || COUNT(*) AS settings_count FROM settings;

-- Check students table has data  
SELECT 'Students count: ' || COUNT(*) AS students_count FROM students;

-- Check classes table has data
SELECT 'Classes count: ' || COUNT(*) AS classes_count FROM classes;

-- Show all active policies (for debugging)
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==============================================================================
-- DONE - Refresh your browser to fetch data from the database
-- ==============================================================================
