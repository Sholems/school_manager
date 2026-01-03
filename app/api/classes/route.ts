import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/classes - Fetch all classes
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('school_id')
            .eq('id', user.id)
            .single()

        if (!userData?.school_id) {
            return NextResponse.json({ error: 'No school assigned' }, { status: 403 })
        }

        const { data: classes, error } = await supabase
            .from('classes')
            .select(`
                *,
                class_teacher:teachers(id, name)
            `)
            .eq('school_id', userData.school_id)
            .order('name')

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(classes)
    } catch (error) {
        console.error('Classes API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/classes - Create a new class
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

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Only admins can create classes' }, { status: 403 })
        }

        const body = await request.json()

        const { data: cls, error } = await supabase
            .from('classes')
            .insert({
                ...body,
                school_id: userData.school_id,
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(cls, { status: 201 })
    } catch (error) {
        console.error('Classes API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
