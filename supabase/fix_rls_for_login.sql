-- Fix RLS policies for student login
-- The login page needs to read students WITHOUT being authenticated
-- Run this in your Supabase SQL Editor

-- =============================================
-- STUDENTS TABLE - Allow public read for login
-- =============================================

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Students are viewable by authenticated users" ON students;
DROP POLICY IF EXISTS "Allow public read for login" ON students;
DROP POLICY IF EXISTS "Enable read for all" ON students;

-- Option 1: Allow anyone to read students (needed for login page)
-- This is safe because passwords should be hashed in production
CREATE POLICY "Allow public read for login" ON students
    FOR SELECT
    USING (true);

-- =============================================
-- CLASSES TABLE - Allow public read
-- =============================================
DROP POLICY IF EXISTS "Classes are viewable by authenticated users" ON classes;
DROP POLICY IF EXISTS "Allow public read" ON classes;

CREATE POLICY "Allow public read" ON classes
    FOR SELECT
    USING (true);

-- =============================================
-- TEACHERS TABLE - Allow public read
-- =============================================
DROP POLICY IF EXISTS "Teachers are viewable by authenticated users" ON teachers;
DROP POLICY IF EXISTS "Allow public read" ON teachers;

CREATE POLICY "Allow public read" ON teachers
    FOR SELECT
    USING (true);

-- =============================================
-- SETTINGS TABLE - Allow public read
-- =============================================
DROP POLICY IF EXISTS "Settings are viewable by authenticated users" ON settings;
DROP POLICY IF EXISTS "Allow public read" ON settings;

CREATE POLICY "Allow public read" ON settings
    FOR SELECT
    USING (true);

-- =============================================
-- For WRITE operations, keep them restricted to authenticated users
-- =============================================

-- Students - only authenticated can insert/update/delete
DROP POLICY IF EXISTS "Authenticated users can insert students" ON students;
CREATE POLICY "Authenticated users can insert students" ON students
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update students" ON students;
CREATE POLICY "Authenticated users can update students" ON students
    FOR UPDATE
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete students" ON students;
CREATE POLICY "Authenticated users can delete students" ON students
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Verify policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('students', 'classes', 'teachers', 'settings');
