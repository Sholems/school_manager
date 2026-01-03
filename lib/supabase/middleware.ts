import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Skip if Supabase is not configured (demo mode)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        return supabaseResponse
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Use getSession instead of getUser - it's faster as it only checks local cookies
        // getUser makes a network request to validate, which is slow
        const { data: { session } } = await supabase.auth.getSession()

        // Only refresh if session exists and is close to expiring (within 5 minutes)
        if (session?.expires_at) {
            const expiresAt = new Date(session.expires_at * 1000)
            const now = new Date()
            const fiveMinutes = 5 * 60 * 1000

            if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
                // Session is expiring soon, refresh it
                await supabase.auth.refreshSession()
            }
        }

    } catch (error) {
        // If Supabase fails, continue without auth
        console.warn('Supabase middleware error:', error)
    }

    return supabaseResponse
}
