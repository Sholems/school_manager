-- Create messages table for internal messaging system
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    from_id UUID NOT NULL,
    from_role TEXT NOT NULL CHECK (from_role IN ('admin', 'teacher', 'student', 'parent', 'staff')),
    to_id UUID NOT NULL,
    to_role TEXT NOT NULL CHECK (to_role IN ('admin', 'teacher', 'student', 'parent', 'staff')),
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_messages_school_id ON messages(school_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_id ON messages(to_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_id ON messages(from_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admin can see all messages for their school
CREATE POLICY "admin_messages_select" ON messages
    FOR SELECT TO authenticated
    USING (
        school_id IN (
            SELECT school_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can see messages sent to them
CREATE POLICY "user_messages_select" ON messages
    FOR SELECT TO authenticated
    USING (
        to_id = auth.uid()
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

-- Users can update their own received messages (mark as read)
CREATE POLICY "user_messages_update" ON messages
    FOR UPDATE TO authenticated
    USING (to_id = auth.uid())
    WITH CHECK (to_id = auth.uid());

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

CREATE TRIGGER messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();
