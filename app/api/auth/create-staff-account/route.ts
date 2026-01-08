import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { 
    safeJsonParse, 
    withRateLimit, 
    errorResponse 
} from '@/lib/api-utils'
import { RATE_LIMITS } from '@/lib/rate-limit'

// POST /api/auth/create-staff-account - Create Supabase Auth account for teacher/staff
export async function POST(request: NextRequest) {
    const rateCheck = withRateLimit(request, RATE_LIMITS.auth)
    if (rateCheck.limited) return rateCheck.response!

    try {
        const { data: body, error: parseError } = await safeJsonParse(request)
        if (parseError) {
            console.error('Parse error:', parseError)
            return errorResponse(parseError, 400)
        }

        const { profileId, profileType, email, password, name } = body
        console.log('Creating account for:', { profileId, profileType, email, name })

        if (!profileId || !profileType || !email || !password) {
            return errorResponse('Profile ID, type, email, and password are required', 400)
        }

        if (!['teacher', 'staff'].includes(profileType)) {
            return errorResponse('Profile type must be teacher or staff', 400)
        }

        // Validate password strength
        if (password.length < 8) {
            return errorResponse('Password must be at least 8 characters', 400)
        }

        let supabase;
        try {
            supabase = createServiceRoleClient()
        } catch (err) {
            console.error('Failed to create service role client:', err)
            return errorResponse('Server configuration error. Please contact admin.', 500)
        }

        // Check if this profile already has an auth account
        const { data: existingProfile, error: profileCheckError } = await supabase
            .from('user_profiles')
            .select('auth_id, email')
            .eq('profile_id', profileId)
            .eq('profile_type', profileType)
            .maybeSingle()

        if (profileCheckError) {
            console.error('Error checking existing profile:', profileCheckError)
            // Continue anyway - table might not exist yet
        }

        if (existingProfile?.auth_id) {
            return errorResponse('This user already has a login account', 400)
        }

        // Create Supabase Auth account
        console.log('Creating Supabase auth account...')
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm
            user_metadata: {
                role: profileType,
                name: name,
                profile_id: profileId
            }
        })

        if (authError || !authData.user) {
            console.error('Failed to create auth account:', authError)
            // Check if user already exists
            if (authError?.message?.includes('already been registered') || authError?.message?.includes('already exists')) {
                return errorResponse('This email is already registered. Use a different email.', 400)
            }
            return errorResponse(authError?.message || 'Failed to create login account. Please try again.', 500)
        }

        console.log('Auth account created, creating user_profiles link...')

        // Create user_profiles link
        const { error: profileError } = await supabase.from('user_profiles').insert({
            auth_id: authData.user.id,
            role: profileType,
            profile_id: profileId,
            profile_type: profileType,
            email: email
        })

        if (profileError) {
            console.error('Failed to create user profile:', profileError)
            // Try to clean up the auth account
            await supabase.auth.admin.deleteUser(authData.user.id)
            return errorResponse('Failed to link account: ' + profileError.message, 500)
        }

        console.log('Account created successfully for:', email)
        return NextResponse.json({
            success: true,
            message: `Login account created successfully for ${name}`,
            email: email
        })
    } catch (error) {
        console.error('Create staff account error:', error)
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
            console.error('Failed to delete auth account:', deleteError)
            return errorResponse('Failed to remove login account', 500)
        }

        return NextResponse.json({
            success: true,
            message: 'Login account removed successfully'
        })
    } catch (error) {
        console.error('Delete staff account error:', error)
        return errorResponse('An unexpected error occurred')
    }
}
