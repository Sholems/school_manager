'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserData {
    id: string
    email: string
    role: 'admin' | 'teacher' | 'student' | 'staff'
    profile_id: string | null
    profile_type: 'teacher' | 'student' | 'staff' | null
}

export function useSupabaseAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('id, email, role, profile_id, profile_type')
                    .eq('id', user.id)
                    .single()
                setUserData(data)
            }

            setLoading(false)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)

                if (session?.user) {
                    const { data } = await supabase
                        .from('users')
                        .select('id, email, role, profile_id, profile_type')
                        .eq('id', session.user.id)
                        .single()
                    setUserData(data)
                } else {
                    setUserData(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase])

    const signIn = useCallback(async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    }, [supabase])

    const signUp = useCallback(async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        return { data, error }
    }, [supabase])

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    }, [supabase])

    return {
        user,
        userData,
        loading,
        signIn,
        signUp,
        signOut,
        supabase,
    }
}

// Hook for fetching data with authentication
export function useSupabaseQuery<T>(
    table: string,
    options?: {
        select?: string
        filter?: { column: string; value: string | number }
        orderBy?: string
    }
) {
    const [data, setData] = useState<T[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    const refetch = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            let query = supabase
                .from(table)
                .select(options?.select || '*')

            if (options?.filter) {
                query = query.eq(options.filter.column, options.filter.value)
            }

            if (options?.orderBy) {
                query = query.order(options.orderBy)
            }

            const { data: result, error: queryError } = await query

            if (queryError) {
                setError(queryError.message)
            } else {
                setData(result as T[])
            }
        } catch (err) {
            setError('Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }, [supabase, table, options?.select, options?.filter, options?.orderBy])

    useEffect(() => {
        refetch()
    }, [refetch])

    return { data, loading, error, refetch }
}
