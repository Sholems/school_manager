import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { hashPasswordWithSupabase } from '@/lib/password'
import { 
    safeJsonParse, 
    withRateLimit, 
    errorResponse
} from '@/lib/api-utils'
import { RATE_LIMITS } from '@/lib/rate-limit'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/students/[id] - Fetch a single student
export async function GET(request: NextRequest, { params }: RouteParams) {
    const rateCheck = withRateLimit(request, RATE_LIMITS.default)
    if (rateCheck.limited) return rateCheck.response!

    try {
        const { id } = await params
        const supabase = createServiceRoleClient()

        const { data: student, error } = await supabase
            .from('students')
            .select(`
                *,
                class:classes(id, name)
            `)
            .eq('id', id)
            .single()

        if (error) {
            return errorResponse('Student not found', 404)
        }

        // Remove password_hash from response
        const { password_hash, ...sanitizedStudent } = student

        return NextResponse.json(sanitizedStudent)
    } catch (error) {
        console.error('Student API error:', error)
        return errorResponse('Internal server error')
    }
}

// PUT /api/students/[id] - Update a student
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const rateCheck = withRateLimit(request, RATE_LIMITS.default)
    if (rateCheck.limited) return rateCheck.response!

    try {
        const { id } = await params
        const supabase = createServiceRoleClient()

        const { data: body, error: parseError } = await safeJsonParse(request)
        if (parseError) {
            return errorResponse(parseError, 400)
        }

        // Remove fields that shouldn't be updated directly
        const { 
            id: _id, 
            class: _class, // This is a joined object from the query
            password,
            password_hash: _pwHash,
            created_at: _createdAt,
            updated_at: _updatedAt,
            ...updateData 
        } = body

        // Hash password if being updated
        if (password) {
            const passwordHash = await hashPasswordWithSupabase(supabase, password)
            updateData.password_hash = passwordHash
        }

        const { data: student, error } = await supabase
            .from('students')
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select(`
                *,
                class:classes(id, name)
            `)
            .single()

        if (error) {
            console.error('Error updating student:', error)
            return errorResponse(error.message)
        }

        // Remove password_hash from response
        const { password_hash, ...sanitizedStudent } = student

        return NextResponse.json(sanitizedStudent)
    } catch (error) {
        console.error('Student API error:', error)
        return errorResponse('Internal server error')
    }
}

// DELETE /api/students/[id] - Delete a student
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const rateCheck = withRateLimit(request, RATE_LIMITS.default)
    if (rateCheck.limited) return rateCheck.response!

    try {
        const { id } = await params
        const supabase = createServiceRoleClient()

        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id)

        if (error) {
            return errorResponse(error.message)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Student API error:', error)
        return errorResponse('Internal server error')
    }
}

