-- =============================================
-- PROPER AUTHENTICATION SYSTEM
-- This creates a unified auth system for all users
-- =============================================

-- Create users profile table to link Supabase Auth to app profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'teacher', 'student', 'parent')),
    profile_id UUID NOT NULL, -- References students.id, staff.id, teachers.id
    profile_type TEXT NOT NULL CHECK (profile_type IN ('student', 'staff', 'teacher')),
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON user_profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_id ON user_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = auth_id);

CREATE POLICY "Service role can manage all profiles"
    ON user_profiles FOR ALL
    USING (true);

-- Function to automatically create auth account for student
CREATE OR REPLACE FUNCTION create_student_auth_account(
    student_id_param UUID,
    student_no_param TEXT,
    password_param TEXT,
    email_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    generated_email TEXT;
    auth_user_id UUID;
    result JSON;
BEGIN
    -- Generate email if not provided
    IF email_param IS NULL THEN
        generated_email := student_no_param || '@student.fruitfulvine.edu.ng';
    ELSE
        generated_email := email_param;
    END IF;

    -- Check if student already has an auth account
    SELECT up.auth_id INTO auth_user_id
    FROM user_profiles up
    WHERE up.profile_id = student_id_param AND up.profile_type = 'student';

    IF auth_user_id IS NOT NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Student already has an auth account',
            'auth_id', auth_user_id
        );
    END IF;

    -- Note: Creating Supabase auth users requires admin privileges
    -- This will be handled by the API endpoint using admin client
    RETURN json_build_object(
        'success', true,
        'email', generated_email,
        'needs_creation', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_student_auth_account(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_student_auth_account(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_student_auth_account(UUID, TEXT, TEXT, TEXT) TO service_role;

-- Function to get user profile info
CREATE OR REPLACE FUNCTION get_user_profile(user_auth_id UUID)
RETURNS JSON AS $$
DECLARE
    profile_data JSON;
BEGIN
    SELECT json_build_object(
        'id', up.id,
        'role', up.role,
        'profile_id', up.profile_id,
        'profile_type', up.profile_type,
        'email', up.email
    ) INTO profile_data
    FROM user_profiles up
    WHERE up.auth_id = user_auth_id;

    RETURN profile_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO anon;

-- Migrate existing admin/staff to user_profiles
-- (You'll need to run this manually for existing users)
-- INSERT INTO user_profiles (auth_id, role, profile_id, profile_type, email)
-- SELECT id, 'admin', id, 'staff', email FROM auth.users WHERE ...;

COMMENT ON TABLE user_profiles IS 'Links Supabase Auth users to application profiles (students, staff, teachers)';
