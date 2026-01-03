// Database types generated from Supabase schema
// These mirror the TypeScript types but match the database column conventions

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            schools: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            users: {
                Row: {
                    id: string
                    email: string
                    role: 'admin' | 'teacher' | 'student' | 'staff'
                    school_id: string
                    profile_id: string | null
                    profile_type: 'teacher' | 'student' | 'staff' | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    role: 'admin' | 'teacher' | 'student' | 'staff'
                    school_id: string
                    profile_id?: string | null
                    profile_type?: 'teacher' | 'student' | 'staff' | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'admin' | 'teacher' | 'student' | 'staff'
                    school_id?: string
                    profile_id?: string | null
                    profile_type?: 'teacher' | 'student' | 'staff' | null
                    created_at?: string
                    updated_at?: string
                }
            }
            students: {
                Row: {
                    id: string
                    school_id: string
                    student_no: string
                    names: string
                    gender: 'Male' | 'Female'
                    class_id: string
                    dob: string
                    parent_name: string
                    parent_email: string | null
                    parent_phone: string
                    address: string
                    passport_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    school_id: string
                    student_no: string
                    names: string
                    gender: 'Male' | 'Female'
                    class_id: string
                    dob: string
                    parent_name: string
                    parent_email?: string | null
                    parent_phone: string
                    address: string
                    passport_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    school_id?: string
                    student_no?: string
                    names?: string
                    gender?: 'Male' | 'Female'
                    class_id?: string
                    dob?: string
                    parent_name?: string
                    parent_email?: string | null
                    parent_phone?: string
                    address?: string
                    passport_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            teachers: {
                Row: {
                    id: string
                    school_id: string
                    name: string
                    email: string
                    phone: string
                    address: string
                    passport_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    school_id: string
                    name: string
                    email: string
                    phone: string
                    address: string
                    passport_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    school_id?: string
                    name?: string
                    email?: string
                    phone?: string
                    address?: string
                    passport_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            classes: {
                Row: {
                    id: string
                    school_id: string
                    name: string
                    class_teacher_id: string | null
                    subjects: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    school_id: string
                    name: string
                    class_teacher_id?: string | null
                    subjects?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    school_id?: string
                    name?: string
                    class_teacher_id?: string | null
                    subjects?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
            }
            // Add more tables as needed...
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'admin' | 'teacher' | 'student' | 'staff'
            gender: 'Male' | 'Female'
        }
    }
}
