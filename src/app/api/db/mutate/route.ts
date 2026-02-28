import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
    let table = ''; let payload: any = {}; let action = '';
    try {
        ({ table, action, payload } = await req.json());

        // Very generic mutation handler using the Service Role to bypass RLS.
        // The payload keys must map exactly to DB column names.
        if (action === 'upsert') {
            const { error } = await supabaseAdmin.from(table).upsert(payload);
            if (error) throw error;
        } else if (action === 'delete') {
            const { error } = await supabaseAdmin.from(table).delete().match(payload);
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Mutate Error:", table, action, JSON.stringify(payload), error);
        return NextResponse.json({ error: error.message || 'Erreur mutation server' }, { status: 500 });
    }
}
