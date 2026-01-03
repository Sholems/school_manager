import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/students - Fetch all students
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get current user and their school
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's school_id
        const { data: userData } = await supabase
            .from('users')
            .select('school_id, role')
            .eq('id', user.id)
            .single()

        if (!userData?.school_id) {
            return NextResponse.json({ error: 'No school assigned' }, { status: 403 })
        }

        // Fetch students for this school
        const { data: students, error } = await supabase
            .from('students')
            .select(`
                *,
                class:classes(id, name)
            `)
            .eq('school_id', userData.school_id)
            .order('names')

        if (error) {
            console.error('Error fetching students:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(students)
    } catch (error) {
        console.error('Students API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
    try {
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

        if (!userData?.school_id) {
            return NextResponse.json({ error: 'No school assigned' }, { status: 403 })
        }

        // Only admins and staff can create students
        if (!['admin', 'staff'].includes(userData.role)) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
        }

        const body = await request.json()

        const { data: student, error } = await supabase
            .from('students')
            .insert({
                ...body,
                school_id: userData.school_id,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating student:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(student, { status: 201 })
    } catch (error) {
        console.error('Students API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
