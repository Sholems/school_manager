-- ==============================================================================
-- FIX MISSING RLS POLICIES (Safe to re-run)
-- Run this in the Supabase SQL Editor to allow users to read their own data
-- ==============================================================================

-- 1. Allow users to read their own profile
DROP POLICY IF EXISTS "users_read_own" ON users;
CREATE POLICY "users_read_own" ON users 
FOR SELECT USING (
    auth.uid() = id
);

-- 2. Allow users to read the school they belong to
DROP POLICY IF EXISTS "schools_read_own" ON schools;
CREATE POLICY "schools_read_own" ON schools 
FOR SELECT USING (
    id IN (SELECT school_id FROM users WHERE id = auth.uid())
);

-- 3. Verify RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
