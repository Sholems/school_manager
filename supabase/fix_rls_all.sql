-- ==============================================================================
-- COMPREHENSIVE RLS POLICIES (Recursion Fixed)
-- Run this in Supabase SQL Editor to ensure App functions correctly in Production
-- ==============================================================================

-- 0. HELPER FUNCTION (SECURITY DEFINER to verify generic policies without recursion)
-- This function runs as the database owner, bypassing RLS on 'users' table lookup
CREATE OR REPLACE FUNCTION get_auth_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 1. SETTINGS (Public Read for School Info, Helper Checks for others)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON settings;
CREATE POLICY "public_read_settings" ON settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_modify_settings" ON settings;
CREATE POLICY "admin_modify_settings" ON settings FOR ALL USING (
   school_id = get_auth_school_id() OR 
   auth.uid() IN (SELECT id FROM users WHERE role = 'admin' AND school_id = settings.school_id)
);

-- 2. ADMISSIONS (Public Insert, Admin Read/Write)
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_admissions" ON admissions;
CREATE POLICY "public_insert_admissions" ON admissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "admin_manage_admissions" ON admissions;
CREATE POLICY "admin_manage_admissions" ON admissions FOR ALL USING (
   school_id = get_auth_school_id()
);

-- 3. GENERIC SCHOOL ISOLATION (Using Helper Function)
-- Applies to: students, teachers, staff, classes, scores, fees, payments, expenses, 
-- attendance, announcements, events, subject_teachers, messages, newsletters

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_students" ON students;
CREATE POLICY "school_isolation_students" ON students FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_teachers" ON teachers;
CREATE POLICY "school_isolation_teachers" ON teachers FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_staff" ON staff;
CREATE POLICY "school_isolation_staff" ON staff FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_classes" ON classes;
CREATE POLICY "school_isolation_classes" ON classes FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_scores" ON scores;
CREATE POLICY "school_isolation_scores" ON scores FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_fees" ON fees;
CREATE POLICY "school_isolation_fees" ON fees FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_payments" ON payments;
CREATE POLICY "school_isolation_payments" ON payments FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_expenses" ON expenses;
CREATE POLICY "school_isolation_expenses" ON expenses FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_attendance" ON attendance;
CREATE POLICY "school_isolation_attendance" ON attendance FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_announcements" ON announcements;
CREATE POLICY "school_isolation_announcements" ON announcements FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_events" ON events;
CREATE POLICY "school_isolation_events" ON events FOR ALL USING (
    school_id = get_auth_school_id()
);

-- Phase 2 Tables if exist
ALTER TABLE IF EXISTS subject_teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_subject_teachers" ON subject_teachers;
CREATE POLICY "school_isolation_subject_teachers" ON subject_teachers FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_messages" ON messages;
CREATE POLICY "school_isolation_messages" ON messages FOR ALL USING (
    school_id = get_auth_school_id()
);

ALTER TABLE IF EXISTS newsletters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "school_isolation_newsletters" ON newsletters;
CREATE POLICY "school_isolation_newsletters" ON newsletters FOR ALL USING (
    school_id = get_auth_school_id()
);


-- 4. USERS (Fix Recursion by using helper or careful logic)
-- Helper function bypasses RLS so it's safe to use in user policies too if needed.
-- But 'users' primarily need to read THEMSELVES and OTHERS in same school.

DROP POLICY IF EXISTS "users_read_own" ON users;
CREATE POLICY "users_read_own" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "admin_read_school_users" ON users;
CREATE POLICY "admin_read_school_users" ON users FOR SELECT USING (
    school_id = get_auth_school_id()
);

