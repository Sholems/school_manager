import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Health Check Endpoint
 * 
 * GET /api/health - Returns system health status
 * 
 * Used by monitoring services to verify the application is running
 * and can connect to essential services.
 */
export async function GET() {
    const startTime = Date.now()
    const checks: Record<string, { status: 'ok' | 'error'; latency?: number; message?: string }> = {}

    // Check database connectivity
    try {
        const dbStart = Date.now()
        const supabase = await createClient()
        const { error } = await supabase.from('settings').select('id').limit(1)
        
        if (error) {
            checks.database = { status: 'error', message: error.message }
        } else {
            checks.database = { status: 'ok', latency: Date.now() - dbStart }
        }
    } catch (error) {
        checks.database = { status: 'error', message: 'Connection failed' }
    }

    // Check if password functions exist (critical for student login)
    try {
        const supabase = await createClient()
        const { error } = await supabase.rpc('verify_student_password', {
            plain_password: 'test',
            hashed_password: 'test'
        })
        
        // The function should return false (not an error) for invalid passwords
        // An error means the function doesn't exist
        if (error && error.message.includes('function') && error.message.includes('does not exist')) {
            checks.password_functions = { status: 'error', message: 'Password functions not deployed' }
        } else {
            checks.password_functions = { status: 'ok' }
        }
    } catch {
        checks.password_functions = { status: 'error', message: 'Check failed' }
    }

    // Overall health
    const allHealthy = Object.values(checks).every(c => c.status === 'ok')
    const totalLatency = Date.now() - startTime

    return NextResponse.json({
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        latency: totalLatency,
        version: process.env.npm_package_version || '1.0.0',
        checks
    }, {
        status: allHealthy ? 200 : 503
    })
}
