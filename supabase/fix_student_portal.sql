-- =============================================
-- FIX STUDENT PORTAL LOGIN
-- Run this in the Supabase SQL Editor
-- =============================================

-- Enable pgcrypto for password functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add password_hash column if it doesn't exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create or replace the password hashing function
CREATE OR REPLACE FUNCTION hash_student_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(plain_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the password verification function
CREATE OR REPLACE FUNCTION verify_student_password(plain_password TEXT, hashed_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF hashed_password IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN hashed_password = crypt(plain_password, hashed_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION hash_student_password(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION hash_student_password(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_student_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_student_password(TEXT, TEXT) TO anon;

-- Create an index on student_no for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_student_no ON students(student_no);

-- =============================================
-- SET A TEST PASSWORD FOR STUDENT "004"
-- Password will be: Samuel@2026
-- You can remove this after testing
-- =============================================

UPDATE students 
SET password_hash = crypt('Samuel@2026', gen_salt('bf', 10))
WHERE student_no = '004';

-- Verify the update
DO $$
DECLARE
    student_record RECORD;
BEGIN
    SELECT student_no, names, password_hash IS NOT NULL as has_password 
    INTO student_record
    FROM students 
    WHERE student_no = '004';
    
    IF student_record.has_password THEN
        RAISE NOTICE '✅ Student % (%) now has a portal password set', 
            student_record.student_no, student_record.names;
    ELSE
        RAISE NOTICE '❌ Failed to set password for student 004';
    END IF;
END $$;

-- Show all students and their portal status
SELECT 
    student_no, 
    names, 
    CASE WHEN password_hash IS NOT NULL THEN '✅ Active' ELSE '❌ Not Set' END as portal_status
FROM students
ORDER BY student_no;
