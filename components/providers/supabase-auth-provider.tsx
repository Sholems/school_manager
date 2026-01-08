'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session, SupabaseClient } from '@supabase/supabase-js'

interface UserData {
    id: string
    email: string
    role: 'admin' | 'teacher' | 'student' | 'staff'
    profile_id: string | null
    profile_type: 'teacher' | 'student' | 'staff' | null
}

interface AuthContextType {
    user: User | null
    userData: UserData | null
    loading: boolean
    supabase: SupabaseClient
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    isDemo: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isDemo, setIsDemo] = useState(false)

    const supabase = createClient()

    // Fetch user profile data from user_profiles table with timeout
    const fetchUserData = useCallback(async (userId: string, email?: string): Promise<UserData> => {
        console.log('[Auth] Fetching user data for:', userId, email)
        
        // Default user data to return on any failure
        const defaultUserData: UserData = {
            id: userId,
            email: email || '',
            role: email?.includes('@student.') ? 'student' : 'admin',
            profile_id: null,
            profile_type: null
        }

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<null>((resolve) => {
            setTimeout(() => {
                console.log('[Auth] Query timeout - using default')
                resolve(null)
            }, 5000) // 5 second timeout
        })

        try {
            // First try user_profiles table (new unified auth for students)
            const profilePromise = supabase
                .from('user_profiles')
                .select('id, role, profile_id, profile_type, email')
                .eq('auth_id', userId)
                .maybeSingle()

            const profileResult = await Promise.race([profilePromise, timeoutPromise])
            
            if (profileResult && 'data' in profileResult) {
                const { data: profileData, error: profileError } = profileResult
                console.log('[Auth] user_profiles query result:', { profileData, profileError })

                if (profileData && !profileError) {
                    console.log('[Auth] Found user in user_profiles:', profileData.role)
                    return {
                        id: userId,
                        email: profileData.email || email || '',
                        role: profileData.role as 'admin' | 'teacher' | 'student' | 'staff',
                        profile_id: profileData.profile_id,
                        profile_type: profileData.profile_type as 'teacher' | 'student' | 'staff' | null
                    }
                }
            }

            // Fallback to old users table for existing admin/staff
            const usersPromise = supabase
                .from('users')
                .select('id, email, role, profile_id, profile_type')
                .eq('id', userId)
                .maybeSingle()

            const usersResult = await Promise.race([usersPromise, timeoutPromise])
            
            if (usersResult && 'data' in usersResult) {
                const { data, error } = usersResult
                console.log('[Auth] users table query result:', { data, error })

                if (!error && data) {
                    console.log('[Auth] Found user in users table:', data.role)
                    return data as UserData
                }
            }

            // If no record found anywhere, return default based on email pattern
            console.log('[Auth] No profile found, using default for:', email)
            return defaultUserData
        } catch (error) {
            console.error('[Auth] Error fetching user data:', error)
            return defaultUserData
        }
    }, [supabase])

    useEffect(() => {
        // Check if Supabase is configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (!supabaseUrl || supabaseUrl.includes('your-project')) {
            setIsDemo(true)
            setLoading(false)
            return
        }

        // Initial session check - use getSession (fast, local check)
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Session error:', error)
                    setLoading(false)
                    return
                }

                if (session?.user) {
                    setUser(session.user)
                    const data = await fetchUserData(session.user.id, session.user.email)
                    setUserData(data)
                }
            } catch (error) {
                console.error('Auth initialization error:', error)
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[Auth] State change:', event)

                if (session?.user) {
                    setUser(session.user)

                    // Only fetch user data on sign in or token refresh
                    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        const data = await fetchUserData(session.user.id, session.user.email)
                        setUserData(data)
                    }
                } else {
                    setUser(null)
                    setUserData(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase, fetchUserData])

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            return { error }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setUserData(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                loading,
                supabase,
                signIn,
                signOut,
                isDemo,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within a SupabaseAuthProvider')
    }
    return context
}
