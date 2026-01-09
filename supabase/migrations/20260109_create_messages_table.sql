-- Create messages table for internal messaging system
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES schools(id) ON DELETE CASCADE,
    from_id UUID NOT NULL,
    from_role TEXT NOT NULL CHECK (from_role IN ('admin', 'teacher', 'student', 'parent', 'staff')),
    to_id UUID NOT NULL,
    to_role TEXT NOT NULL CHECK (to_role IN ('admin', 'teacher', 'student', 'parent', 'staff')),
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add parent_message_id column if table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'parent_message_id') THEN
        ALTER TABLE messages ADD COLUMN parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_messages_school_id ON messages(school_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_id ON messages(to_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_id ON messages(from_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON messages(parent_message_id);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admin_messages_select" ON messages;
DROP POLICY IF EXISTS "user_messages_select" ON messages;
DROP POLICY IF EXISTS "admin_messages_insert" ON messages;
DROP POLICY IF EXISTS "user_messages_reply" ON messages;
DROP POLICY IF EXISTS "user_messages_update" ON messages;
DROP POLICY IF EXISTS "admin_messages_delete" ON messages;

-- RLS Policies

-- Admin can see all messages for their school
CREATE POLICY "admin_messages_select" ON messages
    FOR SELECT TO authenticated
    USING (
        school_id IN (
            SELECT school_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can see messages sent to them (match to_id with their profile_id from users table)
CREATE POLICY "user_messages_select" ON messages
    FOR SELECT TO authenticated
    USING (
        to_id IN (SELECT profile_id FROM users WHERE id = auth.uid())
        OR from_id IN (SELECT profile_id FROM users WHERE id = auth.uid())
        OR to_id = auth.uid()
        OR from_id = auth.uid()
    );

-- Admin can insert messages
CREATE POLICY "admin_messages_insert" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (
        school_id IN (
            SELECT school_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Non-admin users can insert replies (messages with parent_message_id)
CREATE POLICY "user_messages_reply" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (
        (from_id = auth.uid() OR from_id IN (SELECT profile_id FROM users WHERE id = auth.uid()))
        AND parent_message_id IS NOT NULL
    );

-- Users can update their own received messages (mark as read)
CREATE POLICY "user_messages_update" ON messages
    FOR UPDATE TO authenticated
    USING (
        to_id IN (SELECT profile_id FROM users WHERE id = auth.uid())
        OR to_id = auth.uid()
    )
    WITH CHECK (
        to_id IN (SELECT profile_id FROM users WHERE id = auth.uid())
        OR to_id = auth.uid()
    );

-- Admin can delete messages
CREATE POLICY "admin_messages_delete" ON messages
    FOR DELETE TO authenticated
    USING (
        school_id IN (
            SELECT school_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_updated_at ON messages;

CREATE TRIGGER messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();
