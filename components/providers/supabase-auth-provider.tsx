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

    // Fetch user profile data
    const fetchUserData = useCallback(async (userId: string, email?: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, email, role, profile_id, profile_type')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                // RLS error or other issue - provide fallback based on auth user
                console.warn('Could not fetch user profile:', error.message || 'Unknown error')
                return {
                    id: userId,
                    email: email || '',
                    role: 'admin' as const,
                    profile_id: null,
                    profile_type: null
                } as UserData
            }

            if (!data) {
                // No user record exists - return default admin
                console.warn('No user record found, using default admin role')
                return {
                    id: userId,
                    email: email || '',
                    role: 'admin' as const,
                    profile_id: null,
                    profile_type: null
                } as UserData
            }

            return data as UserData
        } catch (error) {
            console.error('Error fetching user data:', error)
            return null
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
