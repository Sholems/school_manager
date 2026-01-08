/**
 * Password Utilities
 * 
 * Secure password hashing using bcrypt-compatible algorithms.
 * Uses Web Crypto API for client-side and native crypto for server-side.
 */

// Simple hash function using Web Crypto API (for client-side demo mode)
// In production with Supabase, use the database functions instead
export async function hashPassword(password: string): Promise<string> {
    // For production, call the Supabase function
    // This is a fallback for demo mode
    const encoder = new TextEncoder();
    const data = encoder.encode(password + process.env.NEXT_PUBLIC_PASSWORD_SALT || 'school-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const computedHash = await hashPassword(password);
    return computedHash === hash;
}

// Server-side: Use Supabase RPC for bcrypt hashing
export async function hashPasswordWithSupabase(
    supabase: any,
    password: string
): Promise<string | null> {
    const { data, error } = await supabase.rpc('hash_student_password', {
        plain_password: password
    });
    
    if (error) {
        console.error('Error hashing password:', error);
        return null;
    }
    
    return data;
}

export async function verifyPasswordWithSupabase(
    supabase: any,
    password: string,
    hashedPassword: string
): Promise<boolean> {
    const { data, error } = await supabase.rpc('verify_student_password', {
        plain_password: password,
        hashed_password: hashedPassword
    });
    
    if (error) {
        console.error('Error verifying password:', error);
        return false;
    }
    
    return data === true;
}
