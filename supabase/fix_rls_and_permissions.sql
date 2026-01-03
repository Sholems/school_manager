-- ==============================================================================
-- FIX RLS PERMISSIONS & DATA VISIBILITY
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Enable RLS on tables (Best Practice)
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON classes;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON classes;
DROP POLICY IF EXISTS "Enable read access for all users" ON students;
DROP POLICY IF EXISTS "Enable read access for all users" ON teachers;
DROP POLICY IF EXISTS "Enable read access for all users" ON staff;
DROP POLICY IF EXISTS "Enable read access for all users" ON settings;

-- 3. Create Permissive Policies (Single Tenant = Open Read is usually fine for directory data)
-- Allow anyone (anon + authenticated) to READ public school data
CREATE POLICY "Enable read access for all users" ON classes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON settings FOR SELECT USING (true);

-- Allow Authenticated users (logged in) to READ/WRITE everything
CREATE POLICY "Enable all access for authenticated users" ON classes USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON students USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON teachers USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON staff USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON settings USING (auth.role() = 'authenticated');

-- 4. Verify Data Exists
SELECT count(*) as class_count FROM classes;
