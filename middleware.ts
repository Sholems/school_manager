import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Skip middleware if Supabase is not configured (demo mode)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        return NextResponse.next()
    }

    try {
        return await updateSession(request)
    } catch (error) {
        // If middleware fails, continue without blocking
        console.warn('Middleware error:', error)
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        /*
         * Match dashboard routes that need session management
         * Skip static files and API routes
         */
        '/dashboard/:path*',
        '/students/:path*',
        '/teachers/:path*',
        '/classes/:path*',
        '/grading/:path*',
        '/attendance/:path*',
        '/bursary/:path*',
        '/settings/:path*',
        '/admissions/:path*',
        '/analytics/:path*',
        '/announcements/:path*',
    ],
}
