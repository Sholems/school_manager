import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { hashPasswordWithSupabase } from '@/lib/password'
import { 
    safeJsonParse, 
    getAuthContext, 
    withRateLimit, 
    errorResponse, 
    unauthorizedResponse, 
    forbiddenResponse 
} from '@/lib/api-utils'
import { RATE_LIMITS } from '@/lib/rate-limit'

// GET /api/students - Fetch all students
export async function GET(request: NextRequest) {
    // Rate limit check
    const rateCheck = withRateLimit(request, RATE_LIMITS.default)
    if (rateCheck.limited) return rateCheck.response!

    try {
        const supabase = await createClient()
        const { user, error: authError } = await getAuthContext(supabase)

        if (authError || !user) {
            return unauthorizedResponse()
        }

        // Simple query - single school system
        const { data: students, error } = await supabase
            .from('students')
            .select(`
                *,
                class:classes(id, name)
            `)
            .order('names')

        if (error) {
            console.error('Error fetching students:', error)
            return errorResponse(error.message)
        }

        // Remove password_hash from response for security
        const sanitizedStudents = students?.map(({ password_hash, ...student }) => student) || []

        return NextResponse.json(sanitizedStudents)
    } catch (error) {
        console.error('Students API error:', error)
        return errorResponse('Internal server error')
    }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
    // Rate limit check
    const rateCheck = withRateLimit(request, RATE_LIMITS.default)
    if (rateCheck.limited) return rateCheck.response!

    try {
        const supabase = await createClient()
        const { user, role, error: authError } = await getAuthContext(supabase)

        if (authError || !user) {
            return unauthorizedResponse()
        }

        // Only admins and staff can create students
        if (!['admin', 'staff'].includes(role || '')) {
            return forbiddenResponse('Only admins and staff can register students')
        }

        const { data: body, error: parseError } = await safeJsonParse(request)
        if (parseError) {
            return errorResponse(parseError, 400)
        }

        // Hash password if provided
        let passwordHash = null
        if (body.password) {
            passwordHash = await hashPasswordWithSupabase(supabase, body.password)
        }

        // Remove plain password from body
        const { password, ...studentData } = body

        const { data: student, error } = await supabase
            .from('students')
            .insert({
                ...studentData,
                password_hash: passwordHash,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating student:', error)
            return errorResponse(error.message)
        }

        // Remove password_hash from response
        const { password_hash, ...sanitizedStudent } = student

        return NextResponse.json(sanitizedStudent, { status: 201 })
    } catch (error) {
        console.error('Students API error:', error)
        return errorResponse('Internal server error')
    }
}
