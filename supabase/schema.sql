-- Supabase Schema for School Management System
-- Single School: Fruitful Vine Heritage Schools
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS (Extended from Supabase Auth)
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'staff')),
    profile_id UUID,
    profile_type TEXT CHECK (profile_type IN ('teacher', 'student', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SETTINGS (Singleton - one row for the school)
-- =============================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_name TEXT NOT NULL,
    school_address TEXT,
    school_email TEXT,
    school_phone TEXT,
    school_tagline TEXT,
    current_session TEXT,
    current_term TEXT,
    logo_url TEXT,
    watermark_url TEXT,
    director_name TEXT,
    director_signature_url TEXT,
    head_of_school_name TEXT,
    head_of_school_signature_url TEXT,
    subjects_global TEXT[] DEFAULT ARRAY[]::TEXT[],
    terms TEXT[] DEFAULT ARRAY['First Term', 'Second Term', 'Third Term'],
    show_position BOOLEAN DEFAULT TRUE,
    show_skills BOOLEAN DEFAULT TRUE,
    promotion_threshold INTEGER DEFAULT 50,
    show_bank_details BOOLEAN DEFAULT FALSE,
    bank_name TEXT,
    bank_account_name TEXT,
    bank_account_number TEXT,
    invoice_notes TEXT,
    invoice_due_days INTEGER DEFAULT 14,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CLASSES
-- =============================================
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    class_teacher_id UUID,
    subjects TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TEACHERS
-- =============================================
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    passport_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for class teacher
ALTER TABLE classes ADD CONSTRAINT fk_class_teacher 
    FOREIGN KEY (class_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;

-- =============================================
-- STAFF
-- =============================================
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    tasks TEXT,
    assigned_modules TEXT[] DEFAULT ARRAY[]::TEXT[],
    passport_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STUDENTS
-- =============================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_no TEXT NOT NULL UNIQUE,
    names TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    dob DATE,
    parent_name TEXT,
    parent_email TEXT,
    parent_phone TEXT,
    address TEXT,
    passport_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SCORES (Report Cards)
-- =============================================
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    session TEXT NOT NULL,
    term TEXT NOT NULL,
    rows JSONB NOT NULL DEFAULT '[]'::JSONB,
    average NUMERIC(5,2),
    position INTEGER,
    total_score NUMERIC(7,2),
    attendance_present INTEGER,
    attendance_total INTEGER,
    affective JSONB DEFAULT '{}'::JSONB,
    psychomotor JSONB DEFAULT '{}'::JSONB,
    teacher_remark TEXT,
    head_teacher_remark TEXT,
    promoted_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, session, term)
);

-- =============================================
-- FEES
-- =============================================
CREATE TABLE fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    session TEXT NOT NULL,
    term TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYMENTS
-- =============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    date DATE NOT NULL,
    method TEXT CHECK (method IN ('cash', 'transfer', 'pos')),
    line_items JSONB DEFAULT '[]'::JSONB,
    remark TEXT,
    session TEXT NOT NULL,
    term TEXT NOT NULL,
    fee_structure_id UUID REFERENCES fees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ATTENDANCE
-- =============================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    session TEXT NOT NULL,
    term TEXT NOT NULL,
    records JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, class_id)
);

-- =============================================
-- ADMISSIONS
-- =============================================
CREATE TABLE admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_name TEXT NOT NULL,
    child_dob DATE,
    child_gender TEXT CHECK (child_gender IN ('Male', 'Female')),
    previous_school TEXT,
    program TEXT CHECK (program IN ('creche', 'pre-school', 'primary')),
    class_applied TEXT,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_address TEXT,
    relationship TEXT CHECK (relationship IN ('Father', 'Mother', 'Guardian')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    admin_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ANNOUNCEMENTS
-- =============================================
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target TEXT DEFAULT 'all' CHECK (target IN ('all', 'class', 'parents', 'teachers', 'staff')),
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    expires_at TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EVENTS
-- =============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    event_type TEXT DEFAULT 'other' CHECK (event_type IN ('academic', 'holiday', 'exam', 'meeting', 'other')),
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'teachers', 'students', 'parents')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SUBJECT TEACHERS (Many-to-Many: Teacher <-> Class/Subject)
-- =============================================
CREATE TABLE subject_teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    session TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, class_id, subject, session)
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- Simple: Authenticated users can access all data
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_teachers ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read/write all data
CREATE POLICY "authenticated_access" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON staff FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON scores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON fees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON admissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_access" ON subject_teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_scores_student ON scores(student_id);
CREATE INDEX idx_scores_session_term ON scores(session, term);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_subject_teachers_teacher ON subject_teachers(teacher_id);
CREATE INDEX idx_subject_teachers_class ON subject_teachers(class_id);

-- =============================================
-- TRIGGERS for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON fees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON admissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
