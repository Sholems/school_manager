-- Fix announcements table - add missing author_role column
-- Run this in Supabase SQL Editor

-- Add author_role column
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'admin' 
CHECK (author_role IN ('admin', 'teacher', 'staff', 'parent', 'student'));

-- Update existing records to have a default author_role
UPDATE announcements SET author_role = 'admin' WHERE author_role IS NULL;
