import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { 
    safeJsonParse, 
    withRateLimit, 
    errorResponse 
} from '@/lib/api-utils'
import { RATE_LIMITS } from '@/lib/rate-limit'

// POST /api/auth/student-login - Verify student portal login
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

        const supabase = await createClient()

        // Find student by student number (case-insensitive)
        const { data: student, error: fetchError } = await supabase
            .from('students')
            .select('id, student_no, names, class_id, password_hash')
            .ilike('student_no', studentNo.trim())
            .single()

        if (fetchError || !student) {
            // Don't reveal if student exists or not
            return errorResponse('Invalid credentials', 401)
        }

        if (!student.password_hash) {
            return errorResponse('Portal access not yet activated. Please contact the school admin.', 403)
        }

        // Verify password using database function
        const { data: isValid, error: verifyError } = await supabase.rpc(
            'verify_student_password',
            {
                plain_password: password,
                hashed_password: student.password_hash
            }
        )

        if (verifyError || !isValid) {
            return errorResponse('Invalid credentials', 401)
        }

        // Return student info (without password)
        const { password_hash, ...safeStudent } = student

        return NextResponse.json({
            success: true,
            student: {
                ...safeStudent,
                role: 'student',
                name: safeStudent.names,
                student_id: safeStudent.id
            }
        })
    } catch (error) {
        console.error('Student login error:', error)
        return errorResponse('An unexpected error occurred')
    }
}

