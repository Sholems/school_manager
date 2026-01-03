import { createClient } from '@/lib/supabase/server'
import { uploadBase64ToR2, generateFileKey } from '@/lib/r2'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/upload - Upload a file to R2
export async function POST(request: NextRequest) {
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

        const body = await request.json()
        const { base64Data, folder, fileName, contentType } = body

        if (!base64Data || !folder || !fileName) {
            return NextResponse.json(
                { error: 'Missing required fields: base64Data, folder, fileName' },
                { status: 400 }
            )
        }

        // Generate unique file key
        const key = generateFileKey(folder, fileName, userData.school_id)

        // Upload to R2
        const url = await uploadBase64ToR2(
            base64Data,
            key,
            contentType || 'image/jpeg'
        )

        return NextResponse.json({ url, key })
    } catch (error) {
        console.error('Upload API error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
