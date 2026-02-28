import { createClient } from '@supabase/supabase-js';

// We explicitly DO NOT export the ANON key here.
// This instance uses the SERVICE_ROLE_KEY to bypass RLS and must ONLY be used on the server.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn("⚠️ Supabase credentials are missing from environment variables.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
