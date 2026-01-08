-- Fix announcements table - make author_id nullable and remove FK constraint
-- The author_id will store the Supabase auth user ID directly
-- Run this in Supabase SQL Editor

-- First, drop the foreign key constraint if it exists
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_author_id_fkey;

-- Modify author_id to be TEXT instead of UUID (to store auth user IDs directly)
-- First add a new column
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS author_id_new TEXT;

-- Copy data (if any)
UPDATE announcements SET author_id_new = author_id::TEXT WHERE author_id IS NOT NULL;

-- Drop old column and rename new one
ALTER TABLE announcements DROP COLUMN IF EXISTS author_id;
ALTER TABLE announcements RENAME COLUMN author_id_new TO author_id;
