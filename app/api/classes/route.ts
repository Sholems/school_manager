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

// GET /api/classes - Fetch all classes
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

        const { data: classes, error } = await supabase
            .from('classes')
            .select(`
                *,
                class_teacher:teachers(id, name)
            `)
            .order('name')

        if (error) {
            return errorResponse(error.message)
        }

        return NextResponse.json(classes)
    } catch (error) {
        console.error('Classes API error:', error)
        return errorResponse('Internal server error')
    }
}

// POST /api/classes - Create a new class
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
            return forbiddenResponse('Only admins can create classes')
        }

        const { data: body, error: parseError } = await safeJsonParse(request)
        if (parseError) {
            return errorResponse(parseError, 400)
        }

        const { data: cls, error } = await supabase
            .from('classes')
            .insert(body)
            .select()
            .single()

        if (error) {
            return errorResponse(error.message)
        }

        return NextResponse.json(cls, { status: 201 })
    } catch (error) {
        console.error('Classes API error:', error)
        return errorResponse('Internal server error')
    }
}
