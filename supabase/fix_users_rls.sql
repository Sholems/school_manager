-- Fix RLS policy for users table
-- Run this in your Supabase SQL Editor

-- First, check if RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can read all" ON users;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Create policy to allow users to update their own data
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- If you want admins to be able to read all users, add this:
-- CREATE POLICY "Admins can read all users" ON users
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM users 
--             WHERE users.id = auth.uid() 
--             AND users.role = 'admin'
--         )
--     );

-- Alternative: If you just want all authenticated users to read their own row
-- This is the simplest and most secure approach
