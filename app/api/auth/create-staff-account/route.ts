import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { 
    safeJsonParse, 
    withRateLimit, 
    errorResponse 
} from '@/lib/api-utils'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { logInfo, logError, logDebug } from '@/lib/logger'

// POST /api/auth/create-staff-account - Create Supabase Auth account for teacher/staff
export async function POST(request: NextRequest) {
    logDebug('Create staff account API called')
    
    const rateCheck = withRateLimit(request, RATE_LIMITS.auth)
    if (rateCheck.limited) {
        logDebug('Rate limited')
        return rateCheck.response!
    }

    try {
        const { data: body, error: parseError } = await safeJsonParse(request)
        if (parseError) {
            logError('Parse error in create-staff-account', parseError)
            return errorResponse(parseError, 400)
        }

        const { profileId, profileType, password, name } = body
        // Trim email to remove any whitespace
        const email = (body.email || '').trim()
        logDebug('Creating account for', { profileId, profileType, email, name })

        if (!profileId || !profileType || !email || !password) {
            logDebug('Missing required fields')
            return errorResponse('Profile ID, type, email, and password are required', 400)
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            logDebug('Invalid email format', { email })
            return errorResponse('Invalid email format', 400)
        }

        if (!['teacher', 'staff'].includes(profileType)) {
            logDebug('Invalid profile type', { profileType })
            return errorResponse('Profile type must be teacher or staff', 400)
        }

        // Validate password strength
        if (password.length < 8) {
            logDebug('Password too short')
            return errorResponse('Password must be at least 8 characters', 400)
        }

        logDebug('Creating service role client...')
        let supabase;
        try {
            supabase = createServiceRoleClient()
            logDebug('Service role client created successfully')
        } catch (err) {
            logError('Failed to create service role client', err as Error)
            return errorResponse('Server configuration error. Please contact admin.', 500)
        }

        // Check if this profile already has an auth account
        logDebug('Checking for existing profile...')
        const { data: existingProfile, error: profileCheckError } = await supabase
            .from('user_profiles')
            .select('auth_id, email')
            .eq('profile_id', profileId)
            .eq('profile_type', profileType)
            .maybeSingle()

        if (profileCheckError) {
            logError('Error checking existing profile', profileCheckError)
            // Continue anyway - table might not exist yet
        } else {
            logDebug('Profile check result', { existingProfile })
        }

        if (existingProfile?.auth_id) {
            logDebug('User already has login account')
            return errorResponse('This user already has a login account', 400)
        }

        // Create Supabase Auth account
        logDebug('Creating Supabase auth account', { email })
        const trimmedName = (name || '').trim()
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm
            user_metadata: {
                role: profileType,
                name: trimmedName,
                profile_id: profileId
            }
        })

        logDebug('Auth creation result', { success: !!authData?.user, error: authError?.message })

        if (authError || !authData.user) {
            logError('Failed to create auth account', authError)
            
            // Get the actual error message
            const errorMessage = authError?.message || 
                                 (authError as any)?.msg || 
                                 (authError as any)?.error_description ||
                                 'Failed to create login account'
            
            // Check if user already exists
            if (errorMessage?.includes('already been registered') || errorMessage?.includes('already exists')) {
                return errorResponse('This email is already registered. Use a different email.', 400)
            }
            
            // Check for validation errors
            if (authError?.code === 'validation_failed' || (authError as any)?.status === 400) {
                return errorResponse('Invalid email or password format. Password must be at least 6 characters.', 400)
            }
            
            return errorResponse(errorMessage, 500)
        }

        logDebug('Auth account created', { userId: authData.user.id })

        // Create user_profiles link
        const { error: profileError } = await supabase.from('user_profiles').insert({
            auth_id: authData.user.id,
            role: profileType,
            profile_id: profileId,
            profile_type: profileType,
            email: email
        })

        logDebug('Profile link result', { success: !profileError })

        if (profileError) {
            logError('Failed to create user profile', profileError)
            // Try to clean up the auth account
            await supabase.auth.admin.deleteUser(authData.user.id)
            return errorResponse('Failed to link account: ' + profileError.message, 500)
        }

        logInfo('Staff account created successfully', { email })
        return NextResponse.json({
            success: true,
            message: `Login account created successfully for ${name}`,
            email: email
        })
    } catch (error) {
        logError('Create staff account error', error as Error)
        return errorResponse('An unexpected error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
}

// DELETE /api/auth/create-staff-account - Remove login account for teacher/staff
export async function DELETE(request: NextRequest) {
    try {
        const { data: body, error: parseError } = await safeJsonParse(request)
        if (parseError) {
            return errorResponse(parseError, 400)
        }

        const { profileId, profileType } = body

        if (!profileId || !profileType) {
            return errorResponse('Profile ID and type are required', 400)
        }

        const supabase = createServiceRoleClient()

        // Find the user profile
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('auth_id')
            .eq('profile_id', profileId)
            .eq('profile_type', profileType)
            .single()

        if (!userProfile?.auth_id) {
            return errorResponse('No login account found for this user', 404)
        }

        // Delete from Supabase Auth (this will cascade delete user_profiles due to FK)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userProfile.auth_id)

        if (deleteError) {
            logError('Failed to delete auth account', deleteError)
            return errorResponse('Failed to remove login account', 500)
        }

        logInfo('Staff account removed successfully', { profileId })
        return NextResponse.json({
            success: true,
            message: 'Login account removed successfully'
        })
    } catch (error) {
        logError('Delete staff account error', error as Error)
        return errorResponse('An unexpected error occurred')
    }
}
