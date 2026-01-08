-- Add report card publication status fields to scores table
-- Run this in Supabase SQL Editor

-- Add is_passed field to track if report card is approved for viewing
ALTER TABLE scores 
ADD COLUMN IF NOT EXISTS is_passed BOOLEAN DEFAULT false;

-- Add passed_at timestamp
ALTER TABLE scores 
ADD COLUMN IF NOT EXISTS passed_at BIGINT;

-- Add passed_by to track who approved the report card
ALTER TABLE scores 
ADD COLUMN IF NOT EXISTS passed_by UUID;

-- Create index for faster filtering of passed/unpassed scores
CREATE INDEX IF NOT EXISTS idx_scores_is_passed ON scores(is_passed);

-- Create index on session, term, is_passed for efficient queries
CREATE INDEX IF NOT EXISTS idx_scores_session_term_passed ON scores(session, term, is_passed);

-- Verify columns were added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'scores' 
AND column_name IN ('is_passed', 'passed_at', 'passed_by');
