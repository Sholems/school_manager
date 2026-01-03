import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/students/[id] - Fetch a single student
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: student, error } = await supabase
            .from('students')
            .select(`
                *,
                class:classes(id, name)
            `)
            .eq('id', id)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        return NextResponse.json(student)
    } catch (error) {
        console.error('Student API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT /api/students/[id] - Update a student
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('school_id, role')
            .eq('id', user.id)
            .single()

        if (!['admin', 'staff', 'teacher'].includes(userData?.role || '')) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
        }

        const body = await request.json()

        const { data: student, error } = await supabase
            .from('students')
            .update({
                ...body,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(student)
    } catch (error) {
        console.error('Student API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/students/[id] - Delete a student
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Only admins can delete students' }, { status: 403 })
        }

        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Student API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
