import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { 
    safeJsonParse, 
    getAuthContext, 
    withRateLimit, 
    errorResponse, 
    unauthorizedResponse, 
    forbiddenResponse 
} from '@/lib/api-utils'
import { RATE_LIMITS } from '@/lib/rate-limit'

// GET /api/teachers - Fetch all teachers
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

        const { data: teachers, error } = await supabase
            .from('teachers')
            .select('*')
            .order('name')

        if (error) {
            return errorResponse(error.message)
        }

        return NextResponse.json(teachers)
    } catch (error) {
        console.error('Teachers API error:', error)
        return errorResponse('Internal server error')
    }
}

// POST /api/teachers - Create a new teacher
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

        if (role !== 'admin') {
            return forbiddenResponse('Only admins can add teachers')
        }

        const { data: body, error: parseError } = await safeJsonParse(request)
        if (parseError) {
            return errorResponse(parseError, 400)
        }

        const { data: teacher, error } = await supabase
            .from('teachers')
            .insert(body)
            .select()
            .single()

        if (error) {
            return errorResponse(error.message)
        }

        return NextResponse.json(teacher, { status: 201 })
    } catch (error) {
        console.error('Teachers API error:', error)
        return errorResponse('Internal server error')
    }
}
