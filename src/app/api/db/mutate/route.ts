import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore as noStore } from 'next/cache';

export async function POST(req: Request) {
    noStore();
    let table = ''; let payload: any = {}; let action = '';
    try {
        ({ table, action, payload } = await req.json());

        // Create client inline to avoid Next.js module caching / environment loading issues
        const sb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // Very generic mutation handler using the Service Role to bypass RLS.
        // The payload keys must map exactly to DB column names.
        if (action === 'upsert') {
            const { error } = await sb.from(table).upsert(payload);
            if (error) throw error;
        } else if (action === 'delete') {
            const { error } = await sb.from(table).delete().match(payload);
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Mutate Error:", table, action, JSON.stringify(payload), error);
        return NextResponse.json({ error: error.message || 'Erreur mutation server' }, { status: 500 });
    }
}
