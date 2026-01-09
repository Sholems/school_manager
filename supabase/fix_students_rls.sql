-- Fix students table RLS policies to allow all authenticated operations
-- Run this in Supabase SQL Editor

-- Drop any conflicting policies
DROP POLICY IF EXISTS "students_school_isolation" ON students;
DROP POLICY IF EXISTS "authenticated_access" ON students;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON students;
DROP POLICY IF EXISTS "Allow public read for login" ON students;
DROP POLICY IF EXISTS "Authenticated users can insert students" ON students;
DROP POLICY IF EXISTS "Authenticated users can update students" ON students;
DROP POLICY IF EXISTS "Authenticated users can delete students" ON students;

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create a simple open policy for authenticated users
CREATE POLICY "authenticated_full_access" ON students
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Also add service role bypass (should already be there but just in case)
-- Service role always bypasses RLS, but this ensures anon role works for reads
CREATE POLICY "public_read_for_login" ON students
    FOR SELECT TO anon
    USING (true);
