-- ==============================================================================
-- CREATE MISSING TABLES & APPLY RLS
-- Run this to fix "relation does not exist" errors
-- ==============================================================================

-- 1. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('salary', 'maintenance', 'supplies', 'utilities', 'other')),
    date DATE NOT NULL,
    description TEXT,
    session TEXT NOT NULL,
    term TEXT NOT NULL,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_isolation_expenses" ON expenses;
CREATE POLICY "school_isolation_expenses" ON expenses FOR ALL USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
);

-- 2. SUBJECT_TEACHERS (Phase 2)
CREATE TABLE IF NOT EXISTS subject_teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    session TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, teacher_id, class_id, subject, session)
);

ALTER TABLE subject_teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_isolation_subject_teachers" ON subject_teachers;
CREATE POLICY "school_isolation_subject_teachers" ON subject_teachers FOR ALL USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
);

-- 3. MESSAGES (Phase 3)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    from_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_role TEXT NOT NULL,
    to_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_role TEXT NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_isolation_messages" ON messages;
CREATE POLICY "school_isolation_messages" ON messages FOR ALL USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
);

-- 4. NEWSLETTERS (Phase 4)
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_data TEXT, -- Storing Base64 as text (Alternative: use Storage Buckets)
    file_name TEXT,
    session TEXT NOT NULL,
    term TEXT NOT NULL,
    published_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_isolation_newsletters" ON newsletters;
CREATE POLICY "school_isolation_newsletters" ON newsletters FOR ALL USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_school ON expenses(school_id);
CREATE INDEX IF NOT EXISTS idx_st_school ON subject_teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_messages_school ON messages(school_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_school ON newsletters(school_id);
