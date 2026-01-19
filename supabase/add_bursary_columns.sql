-- Add is_optional column to fees table
ALTER TABLE fees ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT FALSE;

-- Add assigned_fees and discounts columns to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS assigned_fees TEXT[] DEFAULT '{}';
ALTER TABLE students ADD COLUMN IF NOT EXISTS discounts JSONB[] DEFAULT '{}';

-- Grant permissions if necessary (adjust based on your RLS setup, usually authenticated users need update access)
-- GRANT ALL ON fees TO authenticated;
-- GRANT ALL ON students TO authenticated;
