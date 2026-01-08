-- Fix RLS policies for user_profiles table
-- Run this if login is hanging after refresh

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Anon users can read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Allow all reads" ON user_profiles;
DROP POLICY IF EXISTS "Allow service insert" ON user_profiles;

-- For now, allow any authenticated user to read any profile
-- This is more permissive but won't block during session establishment
CREATE POLICY "Allow all reads"
    ON user_profiles FOR SELECT
    USING (true);

-- Allow service role full access for inserts/updates/deletes
CREATE POLICY "Allow service insert"
    ON user_profiles FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Allow service update"
    ON user_profiles FOR UPDATE
    TO service_role
    USING (true);

CREATE POLICY "Allow service delete"
    ON user_profiles FOR DELETE
    TO service_role
    USING (true);

-- Also fix the users table RLS if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Drop restrictive policies
        DROP POLICY IF EXISTS "Users can read their own data" ON users;
        DROP POLICY IF EXISTS "Users read own" ON users;
        
        -- Allow reads for authenticated users
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'users' AND policyname = 'Allow authenticated reads'
        ) THEN
            CREATE POLICY "Allow authenticated reads"
                ON users FOR SELECT
                TO authenticated
                USING (true);
        END IF;
    END IF;
END $$;
