-- Rename passport_media to passport_url to match TypeScript types
-- Run this in your Supabase SQL Editor

-- STUDENTS
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='passport_media') THEN
        ALTER TABLE students RENAME COLUMN passport_media TO passport_url;
    END IF;
END $$;

-- TEACHERS
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='passport_media') THEN
        ALTER TABLE teachers RENAME COLUMN passport_media TO passport_url;
    END IF;
END $$;

-- STAFF
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff' AND column_name='passport_media') THEN
        ALTER TABLE staff RENAME COLUMN passport_media TO passport_url;
    END IF;
END $$;

-- Verify
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name IN ('passport_media', 'passport_url')
AND table_name IN ('students', 'teachers', 'staff');
