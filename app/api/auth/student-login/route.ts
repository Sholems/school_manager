import { createServiceRoleClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { 
    safeJsonParse, 
    withRateLimit, 
    errorResponse 
} from '@/lib/api-utils'
import { RATE_LIMITS } from '@/lib/rate-limit'

// POST /api/auth/student-login - Proper Supabase Auth for students
export async function POST(request: NextRequest) {
    // Strict rate limiting for auth endpoints to prevent brute force
    const rateCheck = withRateLimit(request, RATE_LIMITS.auth)
    if (rateCheck.limited) return rateCheck.response!

    try {
        const { data: body, error: parseError } = await safeJsonParse(request)
        if (parseError) {
            return errorResponse(parseError, 400)
        }

        const { studentNo, password } = body

        if (!studentNo || !password) {
            return errorResponse('Student number and password are required', 400)
        }

        const supabase = createServiceRoleClient()

        // Find student by student number
        const { data: student, error: fetchError } = await supabase
            .from('students')
            .select('id, student_no, names, class_id, gender, passport_url')
            .ilike('student_no', studentNo.trim())
            .single()

        if (fetchError || !student) {
            return errorResponse('Invalid credentials', 401)
        }

        // Generate email for student
        const studentEmail = `${student.student_no.toLowerCase()}@student.fruitfulvine.edu.ng`

        // Check if student has a user_profile (linked to Supabase auth)
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('auth_id, email')
            .eq('profile_id', student.id)
            .eq('profile_type', 'student')
            .single()

        let authUserId = userProfile?.auth_id

        // If no auth account exists, create one
        if (!authUserId) {
            console.log('Creating Supabase auth account for student:', student.student_no)
            
            // Create auth user using admin client
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: studentEmail,
                password: password,
                email_confirm: true, // Auto-confirm
                user_metadata: {
                    role: 'student',
                    student_no: student.student_no,
                    names: student.names
                }
            })

            if (authError || !authData.user) {
                console.error('Failed to create auth account:', authError)
                return errorResponse('Failed to create account. Please contact admin.', 500)
            }

            authUserId = authData.user.id

            // Create user profile link
            await supabase.from('user_profiles').insert({
                auth_id: authUserId,
                role: 'student',
                profile_id: student.id,
                profile_type: 'student',
                email: studentEmail
            })
        }

        // Sign in the student using regular client
        const clientSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: signInData, error: signInError } = await clientSupabase.auth.signInWithPassword({
            email: studentEmail,
            password: password
        })

        if (signInError) {
            console.error('Sign in error:', signInError)
            return errorResponse('Invalid credentials', 401)
        }

        // Return session and student info
        return NextResponse.json({
            success: true,
            session: signInData.session,
            student: {
                id: student.id,
                student_no: student.student_no,
                names: student.names,
                class_id: student.class_id,
                gender: student.gender,
                passport_url: student.passport_url,
                role: 'student',
                name: student.names,
                student_id: student.id
            }
        })
    } catch (error) {
        console.error('Student login error:', error)
        return errorResponse('An unexpected error occurred')
    }
}

