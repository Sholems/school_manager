-- Add new columns to events table for enhanced calendar functionality
-- Run this in Supabase SQL Editor

-- Add class_id for class-specific events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL;

-- Add session and term to associate events with academic periods
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS session TEXT;

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS term TEXT;

-- Add created_by to track who created the event
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add is_recurring for recurring events (future feature)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- Add recurrence_pattern for recurring events (future feature)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly'));

-- Create index on class_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_events_class_id ON events(class_id);

-- Create index on session/term for academic period filtering
CREATE INDEX IF NOT EXISTS idx_events_session_term ON events(session, term);

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('class_id', 'session', 'term', 'created_by', 'is_recurring', 'recurrence_pattern');
