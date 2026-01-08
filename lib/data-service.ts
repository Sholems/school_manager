/**
 * Data Service Layer
 * 
 * This module provides a unified interface for data operations.
 * All data is fetched directly from Supabase database - no localStorage fallback.
 */

import { createClient } from '@/lib/supabase/client'
import * as Types from '@/lib/types'
import { INITIAL_SETTINGS } from '@/lib/utils'

// Development-only logging
const isDev = process.env.NODE_ENV === 'development';
const devLog = (...args: any[]) => isDev && console.log(...args);

// =============================================
// SETTINGS
// =============================================

export async function fetchSettings(): Promise<Types.Settings> {
    try {
        const supabase = createClient()
        const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle()

        if (error) {
            console.error('[DataService] Settings fetch failed:', error.message);
            return INITIAL_SETTINGS;
        }

        if (!data) {
            devLog('[DataService] No settings found, using defaults');
            return INITIAL_SETTINGS;
        }

        devLog('[DataService] Fetched settings from database');
        // Merge with defaults to ensure new fields are present
        return { ...INITIAL_SETTINGS, ...data } as Types.Settings;
    } catch (err) {
        console.error('[DataService] Unexpected error fetching settings:', err);
        return INITIAL_SETTINGS;
    }
}

export async function updateSettings(settings: Types.Settings): Promise<Types.Settings> {
    try {
        const supabase = createClient()

        // Remove 'singleton' ID so Supabase generates a real UUID if creating
        const safeSettings = { ...settings };
        if (safeSettings.id === 'singleton') {
            delete (safeSettings as any).id;
        }

        // Convert timestamps to ISO strings
        if (typeof safeSettings.created_at === 'number') {
            safeSettings.created_at = new Date(safeSettings.created_at).toISOString() as any;
        }
        if (typeof safeSettings.updated_at === 'number') {
            safeSettings.updated_at = new Date(safeSettings.updated_at).toISOString() as any;
        }

        const { data, error } = await supabase
            .from('settings')
            .upsert(safeSettings) // Use upsert to handle "first save" scenario
            .eq('id', settings.id)
            .select()
            .single()

        if (error) {
            console.error('[DataService] Settings update failed:', error.message);
            throw new Error(error.message);
        }

        devLog('[DataService] Settings updated successfully');
        return data as Types.Settings;
    } catch (err) {
        console.error('[DataService] Unexpected error updating settings:', err);
        throw err;
    }
}

// =============================================
// GENERIC CRUD - All operations use Supabase directly
// =============================================

export async function fetchAll<T>(table: string): Promise<T[]> {
    try {
        const supabase = createClient()
        const { data, error } = await supabase.from(table).select('*')

        if (error) {
            console.error(`[DataService] Fetch failed for ${table}:`, error.message);
            return [];
        }

        devLog(`[DataService] Fetched ${data?.length || 0} rows from ${table}`);
        return (data || []) as T[];
    } catch (err) {
        console.error(`[DataService] Unexpected error fetching ${table}:`, err);
        return [];
    }
}

export async function createItem<T>(table: string, item: any): Promise<T> {
    const supabase = createClient()

    // Prepare item for Supabase
    const safeItem = { ...item };

    // Remove id if empty - let Supabase generate it
    if (safeItem.id === '' || safeItem.id === null || safeItem.id === undefined) {
        delete safeItem.id;
    }

    // Convert timestamps to ISO strings
    if (typeof safeItem.created_at === 'number') {
        safeItem.created_at = new Date(safeItem.created_at).toISOString();
    }
    if (typeof safeItem.updated_at === 'number') {
        safeItem.updated_at = new Date(safeItem.updated_at).toISOString();
    }

    devLog(`[DataService] Creating item in '${table}'`, safeItem);

    const { data, error } = await supabase
        .from(table)
        .insert(safeItem)
        .select()
        .single()

    if (error) {
        console.error(`[DataService] Create failed for '${table}':`, error.message, error.code, error.details, error.hint);
        throw new Error(error.message || 'Failed to create item');
    }

    devLog(`[DataService] Created item in '${table}':`, data.id);
    return data as T;
}

export async function updateItem<T>(table: string, id: string, updates: any): Promise<T> {
    const supabase = createClient()

    // Convert timestamps to ISO strings
    const safeUpdates = { ...updates };
    if (typeof safeUpdates.created_at === 'number') {
        safeUpdates.created_at = new Date(safeUpdates.created_at).toISOString();
    }
    if (typeof safeUpdates.updated_at === 'number') {
        safeUpdates.updated_at = new Date(safeUpdates.updated_at).toISOString();
    }

    devLog(`[DataService] Updating item in '${table}':`, id);

    const { data, error } = await supabase
        .from(table)
        .update(safeUpdates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error(`[DataService] Update failed for '${table}':`, error);
        throw new Error(error.message);
    }

    devLog(`[DataService] Updated item in '${table}':`, id);
    return data as T;
}

export async function deleteItem(table: string, id: string): Promise<void> {
    const supabase = createClient()

    devLog(`[DataService] Deleting item from '${table}':`, id);

    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

    if (error) {
        console.error(`[DataService] Delete failed for '${table}':`, error);
        throw new Error(error.message);
    }

    devLog(`[DataService] Deleted item from '${table}':`, id);
}

// =============================================
// FILE UPLOADS
// =============================================

export async function uploadFile(
    base64Data: string,
    folder: string,
    fileName: string,
    contentType: string = 'image/jpeg'
): Promise<string> {
    // Use API route for R2 upload since R2 credentials are on server
    const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, folder, fileName, contentType }),
    })

    if (!response.ok) {
        throw new Error('Failed to upload file');
    }

    const { url } = await response.json();
    devLog(`[DataService] Uploaded file to:`, url);
    return url;
}
